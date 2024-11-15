import { Sequelize, DataTypes, Model } from "@sequelize/core";
import { Config } from "../fileoperation/FileOperation";

export class User extends Model
{
    declare id: number;
    declare username: string;
    declare password: string;
    declare email: string;
    declare userRole: string;
    declare phoneNumber: string;
    declare city: string;
    declare postCode: number;
    declare state: string;
    declare imageUrl: string;
}

export class Notification extends Model
{
    declare notificationId: number;
    declare userId: number;
    declare message: string;
    declare read: boolean;
    declare createdAt: Date;
    declare updatedAt: Date;
}

export class Feedback extends Model
{
    declare feedbackId: number;
    declare userId: number;
    declare feedback: string;
    declare createdAt: Date;
    declare updatedAt: Date;

}

export class Stall extends Model
{
    declare stallId: number;
    declare stallNo: number;
    declare userId: number;
    declare rentalId: number;
    declare stallName: string;
    declare description: string;
    declare imageUrl: string;
    declare createdAt: Date;
    declare updatedAt: Date;

}

export class Payment extends Model
{
    declare paymentId: number;
    declare userId: number;
    declare rentalId: number;
    declare utilitiesId: number;
    declare amount: number;
    declare paymentDate: Date;
    declare paymentStatus: string;
    declare paymentType: string;
    declare createdAt: Date;
    declare updatedAt: Date;

}

export class Utilities extends Model
{
    declare utilitiesId: number;
    declare userId: number;
    declare rentalId: number;
    declare utilitiesType: string;
    declare utilitiesAmount: number;
    declare utilitiesStatus: string;
    declare createdAt: Date;
    declare updatedAt: Date;

}

export class Rental extends Model
{
    declare rentalId: number;
    declare userId: number;
    declare stallId: number;
    declare rentalStartDate: Date;
    declare rentalEndDate: Date;
    declare rentalStatus: string;
    declare createdAt: Date;
    declare updatedAt: Date;

}


export class SQDatabase
{
    sequelize: Sequelize;
    constructor(config: Config)
    {
        this.sequelize = new Sequelize({
            dialect: config.sequelize.options.dialect,
            storage: `${ config.sequelize.options.storage }`,
            logging: config.sequelize.options.logging,
        });

    }

    async authenticate()
    {
        try
        {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error)
        {
            console.error('Unable to connect to the database:', error);
        }
    }

    public async createTable()
    {
        const user = await this.tableUser();
        const notification = this.tableNotification();
        const Stall = this.tableStall();
        const feedback = this.tableFeedback();
        const payment = this.tablePayment();
        const utilities = this.tableUtilities();
        const rental = this.tableRental();

        await this.sequelize.sync({ alter: true });
        return { user, notification, feedback, Stall, payment, utilities, rental };
    }

    private async tableUser()
    {

        return await User.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(64),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            userRole: {
                type: DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: '2',
                validate: { isIn: [['0', '1', '2']] }
            },
            phoneNumber: {
                type: DataTypes.STRING(13),
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            postCode: {
                type: DataTypes.STRING(5),
                allowNull: true,
            },
            state: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            imageUrl: {
                type: DataTypes.STRING(255),
                allowNull: true,
                defaultValue: 'default.png'
            },
        }, {
            sequelize: this.sequelize,
            modelName: 'User',
        });
    }

    private tableNotification()
    {
        return Notification.init({
            notificationId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false
            },
            read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Notification'
        });
    }

    private tableFeedback()
    {
        return Feedback.init({
            feedbackId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            feedbackType: {
                type: DataTypes.STRING,
                allowNull: false
            },
            feedback: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Feedback'
        });
    }

    private tableStall()
    {
        return Stall.init({
            stallId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            rentalId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            stallNo: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            stallName: {
                type: DataTypes.STRING,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            imageUrl: {
                type: DataTypes.STRING,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Stall'
        });
    }

    private tablePayment()
    {
        return Payment.init({
            paymentId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            rentalId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            utilitiesId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            paymentDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            paymentStatus: {
                type: DataTypes.STRING,
                allowNull: false
            },
            paymentType: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Payment'
        });
    }

    private tableUtilities()
    {
        return Utilities.init({
            utilitiesId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            rentalId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            utilitiesType: {
                type: DataTypes.STRING,
                allowNull: false
            },
            utilitiesAmount: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            utilitiesStatus: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Utilities'
        });
    }

    private tableRental()
    {
        return Rental.init({
            rentalId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            stallId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            rentalStartDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            rentalEndDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            rentalStatus: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        }, {
            sequelize: this.sequelize,
            modelName: 'Rental'
        });
    }
}