import { createAccessControl } from "better-auth/plugins/access";

const statement = {
	dashboard: ["create", "read", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

export const user = ac.newRole({ dashboard: ["read"] });
export const admin = ac.newRole({
	dashboard: ["create", "read", "update", "delete"],
});
export const rental = ac.newRole({ dashboard: ["read", "update"] });

export { ac };
