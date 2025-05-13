const { createAgency, getOneAgency, getAllAgencies, updateAgency, deleteAgency } = require('../service/agencyService')
const { GenericError } = require('../utils/customError');

const create = async (req, res) => {
    const payload = req.body;

    try {
        const newAgency =  await createAgency(payload);

        return res.status(201).json(newAgency);
    } catch (e) {
        console.error(e);
        return res.status(e.status || 500).send(e.message);
    }
}

const update = async (req, res) => {
    const id = +req.params.id;
    const payload = req.body; // name: 'new name '

    try {
        if (id === 1) {
            throw new GenericError(404, 'Cannot update ITSoft');
        }

        const isUpdated = await updateAgency(id, payload);
        const agency = await getOneAgency({id})
        return res.status(204).json({
            isUpdated: Boolean(isUpdated[0]),
            agency
        });
    } catch (e) {
        console.error(e);
        return res.status(e.status || 500).send(e.message);
    }
}

const getAll = async (req, res) => {
    try {
        const agencies =  await getAllAgencies();
        return res.status(200).json(agencies);
    } catch (e) {
        console.error(e);
        return res.status(e.status || 500).send(e.message);
    }
}

const deleteOne = async (req, res) => {
    const id = +req.params.id;
    try {

        if (id === 1) {
            throw new GenericError(404, 'Cannot delete ITSoft');
        }
        const isDeleted = await deleteAgency(id);
        return res.status(204).json({
            isDeleted: !Boolean(isDeleted[0])
        });
    } catch (e) {
        console.error(e);
        return res.status(e.status || 500).send(e.message);
    }
}



module.exports = {
    deleteOne,
    create,
    update,
    getAll
}
