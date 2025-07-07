module.exports = (sequelize, DataTypes) => {
    const Talent = sequelize.define('Talent', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false,
            default: 'ua'
        },
        picture: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            },
        },
        position: {
            type: DataTypes.STRING,
            allowNull: true
        },
        projectName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        agencyName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        birthday: {
            type: DataTypes.DATE,
            allowNull: true
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        telegram: {
            type: DataTypes.STRING,
            allowNull: true
        },
        whatsup: {
            type: DataTypes.STRING,
            allowNull: true
        },
        agencyId: {
            type: DataTypes.INTEGER
        },
        feedbackFrequency: {
            type: DataTypes.ENUM,
            values: ['1w', '2w', '1m'],
            allowNull: true,
            defaultValue: null,
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        talentMainCustomer: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        hourlyRate: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        canWorkOnTwoPositions: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        inactive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        linkedinProfile: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        linkedinProfileChecked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        linkedinProfileDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        linkedinComment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        removeReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        cv: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetTokenExpiry: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        ignoreLinkedinCheck: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ],
    });

    Talent.associate = (models) => {
        Talent.belongsToMany(models.Customer, {
            through: 'TalentCustomer',
        });
        Talent.hasMany(models.TalentCustomer, { onDelete: 'cascade' });
        Talent.hasMany(models.Feedbacks, { as: 'feedbacks' });
        Talent.belongsTo(models.Agencies, { as: 'agency' });
        Talent.hasMany(models.VacationHistory, { as: 'vacations' });

        // Add relationship with TasksEmployee
        Talent.hasMany(models.TasksEmployee, {
            foreignKey: 'talentId',
            onDelete: 'cascade',
        });
        Talent.belongsTo(models.Customer, {
            foreignKey: 'talentMainCustomer',
            as: 'mainCustomer'
        });
        Talent.belongsToMany(models.Organization, {
            through: 'OrganizationsTalents',
            as: 'organizations',
            foreignKey: 'talentId',
            otherKey: 'organizationId'
        });
    };

    return Talent;
};
