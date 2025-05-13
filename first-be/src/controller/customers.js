const { createCustomerService, getCustomerByEmail, updateCustomerService, deleteCustomerService, getAllCustomerEmails } = require("../service/customersService")
const { GenericError } = require("../utils/customError")
const { Customer } = require('../models')
const { sendCronNotification } = require("../worker/cronNotification/sendCronNotification")
const moment = require('moment')
const { sendCustomersMail } = require('../service/emailService')


const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.findAll()
        res.json({ customers })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const getCustomersWithTalents = async (req, res) => {
    try {
        const year = moment().endOf('year').add(1, 'day').format('yyyy')
        const startDate = moment().startOf('year').add(1, 'year')
        const endDate = moment().endOf('year').add(1, 'year')
        const customers = await sendCronNotification(year, startDate, endDate)
        res.json({ customers })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const createCustomer = async (req, res) => {
    try {
        const customer = req.body
        const alreadyExists = await getCustomerByEmail(customer.email)
        if (alreadyExists) throw new GenericError(409, 'Stakeholder with this email already exists')
        const savedCustomer = await createCustomerService(customer)
        res.json({ savedCustomer });
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const updateCustomer = async (req, res) => {
    try {
        const customer = req.body
        await updateCustomerService(customer)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) throw new GenericError(400, 'Bad request')
        await deleteCustomerService(id)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const sendMassEmail = async (req, res) => {
    try {
        const { subject, text } = req.body;
        const fileAttachment = req.file;

        if (!subject) {
            throw new GenericError(400, 'A mail must have a subject and text');
        }
        const emails = await getAllCustomerEmails();

        for (const email of emails) {
            await sendCustomersMail(email, subject, text, fileAttachment);
        }

        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).send(error.message);
    }
};



module.exports = {
    createCustomer, updateCustomer, deleteCustomer, getAllCustomers, getCustomersWithTalents, sendMassEmail
}
