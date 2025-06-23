const { Customer, Talent, TalentCustomer, TasksCustomer } = require("../models")
const { GenericError } = require("../utils/customError")

const createCustomerService = async (customer) => {
    customer.inactive = false;
    const res = await Customer.create(customer)
    return res.dataValues
}

const getCustomerByEmail = async (email) => {
    return Customer.findOne({
        where: { email: email.toLowerCase() }, raw: true
    })
}

const updateCustomerService = async (updatedCustomer) => {
    const { id, ...data } = updatedCustomer
    console.log('updateCustomer', updatedCustomer);
    if (data.email) {
        const existing = await getCustomerByEmail(data.email)
        if (existing && existing.id !== id) throw new GenericError(409, 'Customer with this email already exists')
    }
    delete data.id
    return Customer.update(data, { where: { id } })
}

const deleteCustomerService = async (id) => {
    await TalentCustomer.destroy({ where: { CustomerId: id } });
    await TasksCustomer.destroy({ where: { customerId: id } });
    await Customer.destroy({ where: { id: id } });
};


const getCustomersWithTalents = async () => {
    return Customer.findAll({
        include: [
            {
                model: Talent,
                where: { inactive: false },
                attributes: ['id', 'fullName', 'location'],
                through: { attributes: [] }
            }
        ],
        attributes: ['id', 'fullName', 'email'],
        nest: true
    })
}
const getAllCustomerEmails = async () => {
    const customers = await Customer.findAll({
        attributes: ['email'],
        where: {
            inactive: false
        }
    });
    return customers.map(customer => customer.email);
        // .filter(str => !str.includes('.xyz'));
};


module.exports = {
    createCustomerService, getCustomerByEmail, updateCustomerService, deleteCustomerService, getCustomersWithTalents, getAllCustomerEmails
}
