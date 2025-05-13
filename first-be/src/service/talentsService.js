const { Talent, TalentCustomer, Customer, Feedbacks, VacationHistory, VacationBalance, TasksEmployee,
    OrganizationsTalents, Agencies
} = require("../models")
const { GenericError } = require("../utils/customError")
const { getHolidaysForCountry } = require('./holidayService');

const { sendHolidaysEmail, sendTalentCredentialMail } = require("./emailService")
const moment = require('moment')
const { generatePassword, encryptPassword } = require('../utils/util');
const { PendingFeedbacks } = require('../models');
const { Op } = require('sequelize');

const validateTalent = (talent, isSignup = false) => {
    const fields = ['email']
    if (isSignup) fields.push('name')
    for (const field of fields) {
        if (!talent[field] || !talent[field].trim()) throw new GenericError(406, `${field} is required`)
    }
}
const getTalentByEmail = async (email) => {
    return Talent.findOne({
        where: { email: email.toLowerCase() }, raw: true
    })
}
const createTalent = async (talent, cv = null) => {
    const generatedPassword = generatePassword();
    const encryptedPass = encryptPassword(generatedPassword);
    talent.password = encryptedPass;
    talent.feedbackFrequency = talent.feedbackFrequency ? talent.feedbackFrequency : null;
    talent.inactive = false;
    talent.cv = cv;

    if (Array.isArray(talent.cusIds)) {
        talent.cusIds = talent.cusIds.map(id => Number(id));
    } else if (typeof talent.cusIds === 'string') {
        talent.cusIds = [Number(talent.cusIds)];
    }

    if (talent.agencyId) {
        talent.agencyId = Number(talent.agencyId);
    }

    if (talent.talentMainCustomer) {
        talent.talentMainCustomer = Number(talent.talentMainCustomer);
    }

    if (talent.agencyIdToNumber) {
        talent.agencyIdToNumber = Number(talent.agencyIdToNumber);
    }

    ['isActive', 'hourlyRate', 'canWorkOnTwoPositions', 'linkedinProfileChecked'].forEach(field => {
        if (talent[field] !== undefined) {
            talent[field] = talent[field] === 'true';
        }
    });

    if (Array.isArray(talent.organizations)) {
        talent.organizations = talent.organizations.map(org => ({
            ...org,
            id: org.id ? Number(org.id) : undefined,
        }));
    } else if (talent.organizations && typeof talent.organizations === 'object') {
        // In case it's a single object instead of an array
        talent.organizations = [{
            ...talent.organizations,
            id: talent.organizations.id ? Number(talent.organizations.id) : undefined,
        }];
    }

    const res = await Talent.create(talent)

    // Parse the startDate from the talent object
    const startDate = moment(talent.startDate);

    // Calculate the next feedback date as one week after the startDate
    const nextFeedbackDate = startDate.add(1, 'week'); // First feedback after 1 week from startDate

    await PendingFeedbacks.create({
        talentId: res.id,
        name: talent.fullName,
        email: talent.email,
        picture: talent.picture,
        nextFeedbackDate: nextFeedbackDate.toDate(),
    });

    return {
        createdTalent: res.dataValues,
        generatedPassword
    }
}

const createCustomerDataArr = (cusArr, TalentId) => {
    const bulkData = []
    for (const CustomerId of cusArr) {
        bulkData.push({
            TalentId,
            CustomerId
        })
    }
    return bulkData
}

const uploadTalent = async (talent, cv = null) => {
    const { createdTalent, generatedPassword } = await createTalent(talent, cv);

    const bulkData = createCustomerDataArr(talent.cusIds, createdTalent.id);

    await TalentCustomer.bulkCreate(bulkData);

    if (!talent?.hourlyRate) {
        await sendTalentCredentialMail(createdTalent, generatedPassword, "create");
    }

    return { ...talent, ...createdTalent };
}


const talentUpdate = async (talent, cv = null) => {
    const { password, id, cusIds, ...data } = talent

    if (data.email) {
        const existing = await getTalentByEmail(talent.email)
        if (existing && existing.id !== id) throw new GenericError(409, 'Talent with this email already exists');
    }
    if (password) {
        const encryptedPass = encryptPassword(password);
        data.password = encryptedPass;
        await sendTalentCredentialMail(talent, password, "update");
    }

    data.cv = cv;

    await Talent.update(data, { where: { id } })
    const organization  = talent.organizations;

    if (organization?.length) {
        const organizationId = organization[0].id;

        // Check if there's already an entry for the talent
        const existingOrgTalent = await OrganizationsTalents.findOne({
            where: { talentId: id },
        });

        if (existingOrgTalent) {
            // Update organizationId for the existing talentId
            await OrganizationsTalents.update(
              { organizationId },
              { where: { talentId: id } }
            );
        } else {
            // Insert new relation if not exists
            await OrganizationsTalents.create({
                talentId: id,
                organizationId,
            });
        }
    }

    if (cusIds) {
    const existingCustomerIds = await Customer.findAll({ attributes: ['id'] });
    const validCusIds = cusIds.filter(cusId => existingCustomerIds.some(item => item.id === cusId));
    await TalentCustomer.destroy({ where: { TalentId: id } });
    const bulkData = validCusIds.map(cusId => ({ CustomerId: cusId, TalentId: id }));
    if (bulkData.length > 0) {
      await TalentCustomer.bulkCreate(bulkData);
    }
  }
};

const talentDelete = async (id) => {
    await TasksEmployee.destroy({ where: { talentId: id } });
    await PendingFeedbacks.destroy({ where: { talentId: id } });
    await Feedbacks.destroy({ where: { talentId: id } });
    await VacationHistory.destroy({ where: { talentId: id } });
    await VacationBalance.destroy({ where: { talentId: id } });

    await Talent.destroy({ where: { id } });
}

const sendNotificationToCustomers = async (body) => {
    const { startDate, endDate, year, id } = body
    const talent = await Talent.findOne({
        where: { id },
        include: [
            {
                model: Customer,
                attributes: ['fullName', 'email'],
                through: { attributes: [] }
            }
        ],
        attributes: ['fullName', 'location']
    })
    if (!talent) throw new GenericError(404, 'Talent not found')
    const { fullName, location, Customers } = talent
    const isUkraine = location === 'ua'

    const holidays = await getHolidaysForCountry(location, isUkraine, year, true);

    const filteredHolidays = []
    if (holidays) {
        for (const date in holidays) {
            const hl = holidays[date];
            if (moment(date).isBetween(startDate, endDate)) {
                if (isUkraine && !hl.primary_type.includes('National')) continue;
                filteredHolidays.push({ name: isUkraine ? hl.name.replace('(Suspended)', '') : hl.name, date: moment.utc(date).toDate() })
            }
        }
    }
    if (filteredHolidays.length) {
        for (const cus of Customers) {
            await sendHolidaysEmail({ ...cus.dataValues, [location]: { holidays: filteredHolidays, talents: [fullName] } }, startDate, endDate)
        }
    }
}
const getTalentById = async (id) => {
    return Talent.findOne({
        where: { id }, raw: true
    })
};

const getTalentLocation = async (id) => {
    const talent = await Talent.findOne({
        where: { id },
        attributes: ['location']
    });
    return talent.location;
}

const searchTalents = async ({ search, sortBy = 'fullName', sortOrder = 'ASC', limit = 10, offset = 0 }) => {
    const queryOptions = {
        where: {},
        order: [[sortBy, sortOrder]],
        limit,
        offset,
    };

    if (search) {
        queryOptions.where = {
            [Op.or]: [
                { fullName: { [Op.like]: `%${search}%` } },
                { summary: { [Op.like]: `%${search}%` } },
            ],
        };
    }

    return await Talent.findAll(queryOptions);
};
module.exports = {
    uploadTalent,
    talentUpdate,
    talentDelete,
    validateTalent,
    getTalentByEmail,
    getTalentById,
    sendNotificationToCustomers,
    getTalentLocation,
    searchTalents
}
