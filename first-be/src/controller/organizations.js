const { createOrganizationService, updateOrganizationService } = require("../service/organisationsService")
const { Organization, Customer, TasksCustomer } = require('../models')
const { GenericError } = require("../utils/customError")

const createOrganization = async (req, res) => {
    try {
        const org = req.body
        const savedOrganization = await createOrganizationService(org)
        res.json({ savedOrganization })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const updateOrganization = async (req, res) => {
    try {
        const org = req.body
        await updateOrganizationService(org)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.findAll({ raw: true })
        res.json({ organizations })
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

const getAllOrganizations2 = async () => {
    try {
        const organizations = await Organization.findAll({ raw: true })
        return organizations
    } catch (err) {
        console.error(err)
        throw new GenericError(500, 'Internal server error')
    }
}

const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) throw new GenericError(400, 'Bad request')
        const customers = await Customer.findAll({ where: { organizationId: id } });
        const customerIds = customers.map(c => c.id);

        await TasksCustomer.destroy({ where: { customerId: customerIds } });

        await Organization.destroy({ where: { id } })

        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.status(err.status || 500).send(err.message)
    }
}

module.exports = {
    createOrganization, getAllOrganizations, updateOrganization, deleteOrganization, getAllOrganizations2
}