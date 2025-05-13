const { Agencies, Organization} = require('../models');
const { GenericError } = require('../utils/customError');


const createAgency = async (payload) => {
    const exist = await getOneAgency({
        name: payload.name
    });

    if (exist) {
        throw new GenericError(409, `Agency with "${payload.name}" name already exist.`);
    }
    return Agencies.create(payload);
}

const deleteAgency = (id) => {
    return Agencies.destroy({ where: { id } })
}

const updateAgency = async (id, payload) => {
    const exist = await getOneAgency({
        name: payload.name
    });

    if (exist && exist.id !== id) {
        throw new GenericError(409, `This agency already exists.`)
    }

    return Agencies.update(payload, { where: { id } });
}

const getAllAgencies = () => {
    return Agencies.findAll();
}

const getOneAgency = (where) => {
    return Agencies.findOne({
        where: where
    })
}

module.exports = {
    createAgency,
    deleteAgency,
    updateAgency,
    getAllAgencies,
    getOneAgency
}
