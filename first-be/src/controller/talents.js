const { uploadTalent, talentUpdate, talentDelete, sendNotificationToCustomers, getTalentByEmail, searchTalents } = require("../service/talentsService")
const { GenericError } = require("../utils/customError")
const { Talent, TalentCustomer, Agencies, Customer, Organization, OrganizationsTalents } = require('../models')
const moment = require('moment/moment')
const path = require('path');
const fs = require('fs');
const os = require('os');
const { createTaskEmployee } = require('../service/tasksEmployee')
const { createTaskCustomer } = require('../service/tasksCustomer')


const getAllTalents = async (req, res) => {
    try {
        const { hourlyRate, canWorkOnTwoPositions, inactive, linkedinProfileChecked, linkedinComment } = req.query;

        const whereClause = {};

        // Filter by Hourly Rate (Assuming it's a Boolean)
        if (hourlyRate !== undefined) {
            whereClause.hourlyRate = hourlyRate === 'true'; // Convert string to Boolean
        }

        // Filter by canWorkOnTwoPositions (Assuming it's a Boolean)
        if (canWorkOnTwoPositions !== undefined) {
            whereClause.canWorkOnTwoPositions = canWorkOnTwoPositions === 'true';
        }

        // Filter by inactive (Assuming it's a Boolean)
        if (inactive !== undefined) {
            whereClause.inactive = inactive === 'true';
        }

        // Filter by canWorkOnTwoPositions (Assuming it's a Boolean)
        if (linkedinProfileChecked !== undefined) {
            whereClause.linkedinProfileChecked = linkedinProfileChecked === 'true';
        }

        // Filter by canWorkOnTwoPositions (Assuming it's a Boolean)
        if (linkedinProfileChecked !== undefined) {
            whereClause.linkedinComment = linkedinComment === 'true';
        }


        const talents = await Talent.findAll({
            where: whereClause,
            include: [{
                model: Agencies,
                as: 'agency',
                attributes: ['name'],
            }],
            raw: true
        });

        res.json({ talents });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).send(err.message);
    }
};

const getAggregatedTalents = async (req, res) => {
    try {
        const aggregatedTalents = await Talent.findAll({
            attributes: {exclude: ['password'], include: ['talentMainCustomer', 'hourlyRate', 'canWorkOnTwoPositions', 'inactive', 'linkedinProfileChecked', 'linkedinComment']},
            include: [
                {
                    model: TalentCustomer,
                    attributes: ['CustomerId'],
                },
                {
                    model: Organization,
                    as: 'organizations',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });
        return res.json({ aggregatedTalents })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const safeParse = (val) => {
    try {
        return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
        return [];
    }
};

const createTalent = async (req, res) => {
    try {
        const talent = {
            ...req.body,
            cusIds: safeParse(req.body.cusIds || '[]'),
            organizations: safeParse(req.body.organizations || '[]')
        };

        if (!talent?.cusIds?.length) {
            throw new GenericError(400, 'Talent should have at least one customer');
        }
        const existing = await getTalentByEmail(talent.email)

        if (existing) {
            throw new GenericError(409, 'Talent with this email already exists')
        }

        let cv = null;

        if (req.file) {
            const uploadsDir = path.join(os.homedir(), 'talent_cvs');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `${Date.now()}_${req.file.originalname}`;
            cv = path.join(uploadsDir, fileName);
            fs.writeFileSync(cv, req.file.buffer);
        }

        const savedTalent = await uploadTalent(talent, cv)
        const nextWeekDate = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');

        await Promise.all([
          createTaskEmployee({
            talentId: savedTalent.id,
            comment: `Need to provide task for ${talent.fullName} `,
            dueDate: nextWeekDate,
            risk: "LOW",
            status: "OPEN"
        }),
         createTaskCustomer({
            customerId: talent.talentMainCustomer,
            comment: `Check feedback for ${talent.fullName}`,
            dueDate: nextWeekDate,
            risk: "LOW",
            status: "OPEN"
        })]);
        const organization  = req.body.organizations;

        if (organization?.length > 0) {
            await OrganizationsTalents.create({
                talentId: savedTalent.id,
                organizationId: organization[0].id,
            })
        }

        res.json({ savedTalent })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const updateTalent = async (req, res) => {
    try {
        const rawTalent = { ...req.body };
        let cv = null;
        if (req.file) {
            const uploadsDir = path.join(os.homedir(), 'talent_cvs');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const fileName = `${Date.now()}_${req.file.originalname}`;
            cv = path.join(uploadsDir, fileName);
            fs.writeFileSync(cv, req.file.buffer);
        }
        const talent = normalizeTalentInput(rawTalent);
        await talentUpdate(talent, cv)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const deleteTalent = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) throw new GenericError(400, 'Bad request')
        await talentDelete(id)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const getTalentCV = async (id, res) => {
    const talent = await Talent.findByPk(id);

    if (!talent || !talent.cv) {
        const error = new Error('CV not found');
        error.status = 404;
        throw error;
    }

    const filePath = path.resolve(talent.cv);

    if (!fs.existsSync(filePath)) {
        const error = new Error('File not found on disk');
        error.status = 404;
        throw error;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    return fs.createReadStream(filePath);
}

const sendNotificationManually = async (req, res) => {
    try {
        await sendNotificationToCustomers(req.body)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const search = async (req, res) => {
    try {
        const { search, sortBy, sortOrder, limit, offset } = req.query;

        const talents = await searchTalents({
            search,
            sortBy,
            sortOrder,
            limit: parseInt(limit, 10) || 10,
            offset: parseInt(offset, 10) || 0,
        });

        res.status(200).json(talents);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message });
    }
};

const normalizeTalentInput = (talent) => {
    // Convert strings to number
    const numberFields = [
        'id',
        'agencyId',
        'agencyIdToNumber',
        'talentMainCustomer'
    ];

    numberFields.forEach(field => {
        if (talent[field] !== undefined) {
            talent[field] = Number(talent[field]);
        }
    });

    // Convert booleans from string
    const booleanFields = [
        'isActive',
        'hourlyRate',
        'canWorkOnTwoPositions',
        'linkedinProfileChecked',
        'inactive'
    ];

    booleanFields.forEach(field => {
        if (talent[field] !== undefined) {
            talent[field] = talent[field] === 'true';
        }
    });

    // Parse and convert cusIds
    try {
        if (typeof talent.cusIds === 'string') {
            talent.cusIds = JSON.parse(talent.cusIds);
        }
        if (Array.isArray(talent.cusIds)) {
            talent.cusIds = talent.cusIds.map(Number);
        }
    } catch {
        talent.cusIds = [];
    }

    // Parse and convert organizations
    try {
        if (typeof talent.organizations === 'string') {
            talent.organizations = JSON.parse(talent.organizations);
        }
        if (Array.isArray(talent.organizations)) {
            talent.organizations = talent.organizations.map(org => ({
                ...org,
                id: Number(org.id)
            }));
        }
    } catch {
        talent.organizations = [];
    }

    return talent;
};

module.exports = {
    createTalent,
    updateTalent,
    deleteTalent,
    getAllTalents,
    getAggregatedTalents,
    sendNotificationManually,
    search,
    normalizeTalentInput,
    getTalentCV
}
