import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from '@sequelize/core'
import {
  Attribute,
  AutoIncrement,
  BelongsTo,
  Default,
  HasMany,
  NotNull,
  PrimaryKey,
  Table,
  Unique,
} from '@sequelize/core/decorators-legacy'

export type UserAttributes = InferAttributes<user>
export type SessionAttributes = InferAttributes<session>
export type StallAttributes = InferAttributes<Stall>
export type StallTierAttributes = InferAttributes<StallTier>
export type NotificationAttributes = InferAttributes<Notification>
export type AccountAttributes = InferAttributes<account>

export type UserStallAttributes = InferAttributes<user> & {
  user: UserAttributes[]
  stalls: StallAttributes[]
}

export type StallUserAttributes = InferAttributes<Stall> & {
  stallTierNumber: StallTierAttributes
  stallOwnerId: UserAttributes
  user: UserAttributes
  stalls: StallAttributes[]
  stall: StallAttributes // Add this to resolve the error
}

export type StallStallTierUserAttributes = InferAttributes<Stall> & {
  stallNumber: StallTierAttributes // Correct StallTierAttributes structure
  stallOwner: UserAttributes // Corrected user reference
  stall: StallAttributes
  user: UserAttributes
}

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
  declare id: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare email: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare emailVerified: CreationOptional<boolean>

  @Attribute(DataTypes.STRING)
  declare image: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.STRING)
  @Default('user')
  declare role: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  @Default(false)
  declare banned: CreationOptional<boolean>

  @Attribute(DataTypes.STRING)
  declare banReason: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  declare banExpires: CreationOptional<Date>

  @Attribute(DataTypes.STRING)
  declare phone: CreationOptional<string>

  // 'stallOwner' in Stall references UserTable.id
  @HasMany(() => Stall, 'stallOwner')
  declare stalls?: NonAttribute<Stall[]>
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
  declare id: CreationOptional<string>

  @Attribute(DataTypes.TEXT)
  @NotNull
  declare accountId: CreationOptional<string>

  @BelongsTo(() => user, 'userId')
  declare accountUser?: NonAttribute<user>
  @Attribute(DataTypes.STRING)
  @NotNull
  declare userId: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare providerId: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare accessToken: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare refreshToken: CreationOptional<string>

  @Attribute(DataTypes.TEXT)
  declare idToken: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  declare accessTokenExpiresAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare refreshTokenExpiresAt: CreationOptional<Date>

  @Attribute(DataTypes.STRING)
  declare scope: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare password: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare updatedAt: CreationOptional<Date>
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
  declare id: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare expiresAt: CreationOptional<Date>

  @Attribute(DataTypes.STRING)
  @NotNull
  @Unique
  declare token: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.STRING)
  declare ipAddress: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare userAgent: CreationOptional<string>

  @BelongsTo(() => user, 'userId')
  declare sessionUser?: NonAttribute<user>
  @Attribute(DataTypes.STRING)
  declare userId: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare impersonatedBy: CreationOptional<string>
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
  declare id: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare identifier: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare value: CreationOptional<string>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare expiresAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @Default(DataTypes.NOW)
  @NotNull
  declare updatedAt: CreationOptional<Date>
}

export class Stall extends Model<
  InferAttributes<Stall>,
  InferCreationAttributes<Stall>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @NotNull
  declare stallNumber: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @Default('Still Empty...')
  declare stallName: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare description: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare stallImage: CreationOptional<string>

  @Attribute(DataTypes.DECIMAL(12, 2))
  declare stallSize: CreationOptional<number>

  @BelongsTo(() => StallTier, 'stallTierNo')
  declare stallTierNumber?: NonAttribute<StallTier>
  @Attribute(DataTypes.INTEGER)
  declare stallTierNo: CreationOptional<number>

  @BelongsTo(() => user, 'stallOwner')
  declare stallOwnerId?: NonAttribute<user>
  @Attribute(DataTypes.STRING)
  declare stallOwner: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare rentStatus: CreationOptional<boolean>

  @Attribute(DataTypes.DATE)
  declare startAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  declare endAt: CreationOptional<Date>

  // 'userId' in User references PaymentTable.id
  @HasMany(() => Utilities, 'stallId')
  declare utilities?: NonAttribute<Utilities[]>
}

export class StallTier extends Model<
  InferAttributes<StallTier>,
  InferCreationAttributes<StallTier>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @NotNull
  declare tierId: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare tierName: CreationOptional<string>

  @Attribute(DataTypes.DECIMAL(12, 2))
  @NotNull
  declare tierPrice: CreationOptional<number>

  @HasMany(() => Stall, 'stallTierNo')
  declare stallsTier?: NonAttribute<Stall[]>
}

export class Feedback extends Model<
  InferAttributes<Feedback>,
  InferCreationAttributes<Feedback>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  declare feedbackContent: CreationOptional<string>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare happiness: CreationOptional<number>

  @BelongsTo(() => Stall, 'stall')
  declare feedbackStall?: NonAttribute<Stall>
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare stall: CreationOptional<number>
}

export class Payment extends Model<
  InferAttributes<Payment>,
  InferCreationAttributes<Payment>
> {
  @Attribute(DataTypes.TEXT)
  @PrimaryKey
  @NotNull
  declare paymentId: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare paymentType: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  declare paymentAmount: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  @Default(false)
  declare paymentStatus: CreationOptional<boolean>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare paymentDate: CreationOptional<Date>

  @BelongsTo(() => Stall, 'stallId')
  declare stall?: NonAttribute<Stall>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare stallId: CreationOptional<number>

  @BelongsTo(() => user, 'userId')
  declare paymentUser?: NonAttribute<user>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare userId: CreationOptional<string>
}

export class Utilities extends Model<
  InferAttributes<Utilities>,
  InferCreationAttributes<Utilities>
> {
  @Attribute(DataTypes.TEXT)
  @PrimaryKey
  @NotNull
  declare id: CreationOptional<string>

  @BelongsTo(() => Stall, 'stallId')
  declare utilitiesStall?: NonAttribute<Stall>
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare stallId: CreationOptional<number>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare utilityType: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare utilityPayment: CreationOptional<boolean>

  @Attribute(DataTypes.DECIMAL(12, 2))
  @NotNull
  declare utilityAmount: number
}

export class Notification extends Model<
  InferAttributes<Notification>,
  InferCreationAttributes<Notification>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @NotNull
  @AutoIncrement
  declare notificationId: CreationOptional<number>

  @BelongsTo(() => user, 'userId')
  declare notificationUser?: NonAttribute<user>

  @Attribute(DataTypes.STRING)
  declare userId: CreationOptional<string>

  @Attribute(DataTypes.STRING)
  @NotNull
  declare notificationMessage: CreationOptional<string>

  @Attribute(DataTypes.BOOLEAN)
  declare notificationRead: CreationOptional<boolean>

  @Attribute(DataTypes.DATE)
  declare appointmentDate: CreationOptional<Date>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare stallNumber: CreationOptional<number>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE)
  @NotNull
  declare updatedAt: CreationOptional<Date>
}
