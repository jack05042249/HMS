const { Organization } = require('../models')
const { GenericError } = require('../utils/customError')

const getOrganizationByName = async (name) => {
    return Organization.findOne({
        where: { name: name.toLowerCase() }, raw: true
    })
}

const createOrganizationService = async (org) => {
    const exists = await getOrganizationByName(org.name)
    if (exists) throw new GenericError(409, 'This organization already exists')
    const res = await Organization.create(org)
    return res.dataValues
}

const updateOrganizationService = async (org) => {
    const exists = await getOrganizationByName(org.name)
    if (exists && exists.id !== org.id) throw new GenericError(409, 'This organization already exists')
    const { id, ...rest } = org
    delete org.id
    await Organization.update(rest, { where: { id } })
}


module.exports = { createOrganizationService, updateOrganizationService }