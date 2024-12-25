import {
	DataTypes,
	Model,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
	type NonAttribute,
} from "@sequelize/core";
import {
	Attribute,
	PrimaryKey,
	NotNull,
	Default,
	BelongsTo,
	Unique,
	Table,
	AutoIncrement,
	HasMany,
} from "@sequelize/core/decorators-legacy";

export type UserAttributes = InferAttributes<user>;
export type SessionAttributes = InferAttributes<session>;

@Table({
	freezeTableName: true,
})
export class user extends Model<
	InferAttributes<user>,
	InferCreationAttributes<user>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare id: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare name: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Unique
	declare email: string;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	@Default(false)
	declare emailVerified: CreationOptional<boolean>;

	@Attribute(DataTypes.STRING)
	declare image: string;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;

	@Attribute(DataTypes.STRING)
	@Default("user")
	declare role: CreationOptional<string>;

	@Attribute(DataTypes.BOOLEAN)
	@Default(false)
	declare banned: CreationOptional<boolean>;

	@Attribute(DataTypes.STRING)
	declare banReason: string;

	@Attribute(DataTypes.DATE)
	declare banExpires: Date;

	@Attribute(DataTypes.STRING)
	declare phone: string;

	// 'stallOwner' in Stall references UserTable.id
	@HasMany(() => Stall, "stallOwner")
	declare stalls?: NonAttribute<Stall[]>;
}

@Table({
	freezeTableName: true,
})
export class account extends Model<
	InferAttributes<account>,
	InferCreationAttributes<account>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare id: CreationOptional<string>;

	@Attribute(DataTypes.TEXT)
	@NotNull
	declare accountId: string;

	@BelongsTo(() => user, "userId")
	declare accountUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	@NotNull
	declare userId: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare providerId: string;

	@Attribute(DataTypes.STRING)
	declare accessToken: string;

	@Attribute(DataTypes.STRING)
	declare refreshToken: string;

	@Attribute(DataTypes.TEXT)
	declare idToken: string;

	@Attribute(DataTypes.DATE)
	declare accessTokenExpiresAt: Date;

	@Attribute(DataTypes.DATE)
	declare refreshTokenExpiresAt: Date;

	@Attribute(DataTypes.STRING)
	declare scope: string;

	@Attribute(DataTypes.STRING)
	declare password: string;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
}

@Table({
	freezeTableName: true,
})
export class session extends Model<
	InferAttributes<session>,
	InferCreationAttributes<session>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare id: CreationOptional<string>;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare expiresAt: Date;

	@Attribute(DataTypes.STRING)
	@NotNull
	@Unique
	declare token: string;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;

	@Attribute(DataTypes.STRING)
	declare ipAddress: string;

	@Attribute(DataTypes.STRING)
	declare userAgent: string;

	@BelongsTo(() => user, "userId")
	declare sessionUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	declare userId: string;

	@Attribute(DataTypes.STRING)
	declare impersonatedBy: string;
}

@Table({
	freezeTableName: true,
})
export class verification extends Model<
	InferAttributes<verification>,
	InferCreationAttributes<verification>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare id: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare identifier: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare value: string;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare expiresAt: Date;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
}

export class Stall extends Model<
	InferAttributes<Stall>,
	InferCreationAttributes<Stall>
> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@NotNull
	declare stallNumber: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@Default("Still Empty...")
	declare stallName: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	declare description: string;

	@Attribute(DataTypes.STRING)
	declare stallImage: string;

	@Attribute(DataTypes.DECIMAL(12, 2))
	declare stallSize: number;

	@BelongsTo(() => StallTier, "stallTierNo")
	declare stallTierNumber?: NonAttribute<StallTier>;
	@Attribute(DataTypes.INTEGER)
	declare stallTierNo: number;

	@BelongsTo(() => user, "stallOwner")
	declare stallOwnerId?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	declare stallOwner: string;

	@Attribute(DataTypes.BOOLEAN)
	@NotNull
	@Default(false)
	declare rentStatus: CreationOptional<boolean>;

	@Attribute(DataTypes.DATE)
	declare startAt: Date;

	@Attribute(DataTypes.DATE)
	declare endAt: Date;
}

export class StallTier extends Model<
	InferAttributes<StallTier>,
	InferCreationAttributes<StallTier>
> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@NotNull
	declare tierId: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare tierName: string;

	@Attribute(DataTypes.DECIMAL(12, 2))
	@NotNull
	declare tierPrice: number;
}

export class Feedback extends Model<
	InferAttributes<Feedback>,
	InferCreationAttributes<Feedback>
> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	declare id: CreationOptional<number>;

	@Attribute(DataTypes.STRING)
	declare feedbackContent: string;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare happiness: number;

	// @BelongsTo(() => Stall, "stall")
	// declare feedbackStall?: NonAttribute<Stall>;
	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare stall: number;
}

export class Payment extends Model<
	InferAttributes<Payment>,
	InferCreationAttributes<Payment>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare paymentId: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare paymentType: string;

	@Attribute(DataTypes.STRING)
	declare paymentAmount: string;

	@Attribute(DataTypes.STRING)
	@Default("Pending")
	@NotNull
	declare paymentStatus: CreationOptional<string>;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare paymentDate: Date;

	@BelongsTo(() => Stall, "stallId")
	declare paymentStall?: NonAttribute<Stall>;
	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare stallId?: number;

	@BelongsTo(() => UtilitiesWater, "utilitiesId")
	declare paymentUtilitiesWater?: NonAttribute<UtilitiesWater>;
	@Attribute(DataTypes.STRING)
	declare utilitiesId?: string;
}

export class UtilitiesWater extends Model<
	InferAttributes<UtilitiesWater>,
	InferCreationAttributes<UtilitiesWater>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare id: CreationOptional<string>;

	@BelongsTo(() => user, "userId")
	declare utilitiesUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	@NotNull
	declare userId: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare utilityType: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare utilityPayment: string;
}

export class Notification extends Model<
	InferAttributes<Notification>,
	InferCreationAttributes<Notification>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare notificationId: CreationOptional<string>;

	@BelongsTo(() => user, "userId")
	declare notificationUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	declare userId: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare notificationMessage: string;

	@Attribute(DataTypes.BOOLEAN)
	@Default(false)
	@NotNull
	declare notificationRead: CreationOptional<boolean>;
}

export class Appointment extends Model<
	InferAttributes<Appointment>,
	InferCreationAttributes<Appointment>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare appointmentId: CreationOptional<string>;

	@Attribute(DataTypes.DATE)
	@NotNull
	declare appointmentDate: Date;

	@BelongsTo(() => user, "userId")
	declare appointmentUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	@NotNull
	declare userId: string;

	@BelongsTo(() => Stall, "stallId")
	declare appointmentStall?: NonAttribute<Stall>;
	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare stallId: number;

	@Attribute(DataTypes.BOOLEAN)
	@Default(false)
	@NotNull
	declare appointmentStatus: CreationOptional<boolean>;
}
