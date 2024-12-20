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
} from "@sequelize/core/decorators-legacy";

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
	declare banned: boolean;

	@Attribute(DataTypes.STRING)
	declare banReason: string;

	@Attribute(DataTypes.DATE)
	declare banExpires: Date;

	@Attribute(DataTypes.STRING)
	declare phone: string;
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
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	@NotNull
	declare stallId: CreationOptional<string>;

	@Attribute(DataTypes.INTEGER)
	@NotNull
	declare stallNumber: number;

	@Attribute(DataTypes.STRING)
	@Default("Still Empty...")
	declare stallName: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	declare description: string;

	@Attribute(DataTypes.STRING)
	declare stallImage: string;

	@Attribute(DataTypes.STRING)
	@NotNull
	declare rentStatus: string;

	@Attribute(DataTypes.DATE)
	declare startAt: Date;

	@Attribute(DataTypes.DATE)
	declare endAt: Date;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
}

export class Feedback extends Model<
	InferAttributes<Feedback>,
	InferCreationAttributes<Feedback>
> {
	@Attribute(DataTypes.TEXT)
	@PrimaryKey
	declare feedbackId: CreationOptional<string>;

	@Attribute(DataTypes.STRING)
	declare feedbackType: string;

	@BelongsTo(() => user, "userId")
	declare feedbackUser?: NonAttribute<user>;
	@Attribute(DataTypes.STRING)
	declare userId: string;

	@Attribute(DataTypes.STRING)
	declare feedbackContent: string;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
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
	@Attribute(DataTypes.STRING)
	@NotNull
	declare stallId?: string;

	@BelongsTo(() => UtilitiesWater, "utilitiesId")
	declare paymentUtilitiesWater?: NonAttribute<UtilitiesWater>;
	@Attribute(DataTypes.STRING)
	declare utilitiesId?: string;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
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

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
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

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare createdAt: CreationOptional<Date>;

	@Attribute(DataTypes.DATE)
	@Default(DataTypes.NOW)
	@NotNull
	declare updatedAt: CreationOptional<Date>;
}
