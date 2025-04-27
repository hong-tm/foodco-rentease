import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	dashboard: ["create", "read", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const admin = ac.newRole({
	...adminAc.statements,
	dashboard: ["create", "read", "update", "delete"],
});
export const user = ac.newRole({ dashboard: ["read"] });
export const rental = ac.newRole({ dashboard: ["read", "update"] });

export { ac };
