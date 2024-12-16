import {
	Sequelize,
	DataTypes,
	Model,
	type InferAttributes,
	type InferCreationAttributes,
	type CreationOptional,
} from "@sequelize/core";
import type { UUID } from "@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/data-types.js";
import {
	Attribute,
	PrimaryKey,
	AutoIncrement,
	NotNull,
	Default,
} from "@sequelize/core/decorators-legacy";
import { SqliteDialect } from "@sequelize/sqlite3";

const sequelize = new Sequelize({ dialect: SqliteDialect });

export class Stall extends Model<
	InferAttributes<Stall>,
	InferCreationAttributes<Stall>
> {
	@Attribute(DataTypes.INTEGER)
	@PrimaryKey
	@AutoIncrement
	@NotNull
	declare stallId: number;

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
	declare userId: string;

	@Attribute(DataTypes.STRING)
	@Default(DataTypes.NOW)
	declare registeredAt: CreationOptional<Date>;

	@Attribute(DataTypes.STRING)
	@Default(DataTypes.NOW)
	declare updatedAt: CreationOptional<Date>;
}

export class Feedback extends Model<
	InferAttributes<Feedback>,
	InferCreationAttributes<Feedback>
> {
	@Attribute(DataTypes.UUID)
	@PrimaryKey
	declare feedbackId: UUID;
}
