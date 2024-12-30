import { account, Feedback, Stall, StallTier, user } from "./userModel.js";

export default function initDB() {
	{
		initUser();
		initAccount();
		initStallTier();
		initStall();
		initFeeedback();
	}
}

function initStall() {
	Stall.findOrCreate({
		where: { stallNumber: "1" },
		defaults: {
			stallName: "Salad Chicken Rice",
			description: "This is stall 1",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-09-13.png",
			stallSize: 10.0,
			stallTierNo: 1,
			stallOwner: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			rentStatus: true,
			startAt: new Date("2024-12-25 11:03:34.681+08"),
			endAt: new Date("2025-12-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "2" },
		defaults: {
			stallName: "Nosak",
			description: "This is stall 2",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-09-01.png",
			stallSize: 13.5,
			stallTierNo: 2,
			stallOwner: "Kj7Z8IHo5UlgZYHexjSlxC2XYOEyqGa7",
			rentStatus: true,
			startAt: new Date("2024-08-25 11:03:34.681+08"),
			endAt: new Date("2025-08-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "3" },
		defaults: {
			stallName: "Clatpot Mee/Tom Yam Mee",
			description: "This is stall 3",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-08-03.png",
			stallSize: 15.5,
			stallTierNo: 3,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "4" },
		defaults: {
			stallName: "Pao",
			description: "This is stall 4",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-07-49.png",
			stallSize: 12.0,
			stallTierNo: 1,
			stallOwner: "xTSdZUUynTHmq8G_bmV-L",
			rentStatus: true,
			startAt: new Date("2024-10-25 11:03:34.681+08"),
			endAt: new Date("2025-10-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "5" },
		defaults: {
			stallName: "Kao San Garden Seafood",
			description: "This is stall 5",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-07-30.png",
			stallSize: 11.0,
			stallTierNo: 2,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "6" },
		defaults: {
			stallName: "Ming Ming Seafood",
			description: "This is stall 6",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-07-24.png",
			stallSize: 14.0,
			stallTierNo: 3,
			stallOwner: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			rentStatus: true,
			startAt: new Date("2024-11-25 11:03:34.681+08"),
			endAt: new Date("2025-11-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "7" },
		defaults: {
			stallName: "Little Feul Up Western",
			description: "This is stall 7",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-07-15.png",
			stallSize: 13.0,
			stallTierNo: 1,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "8" },
		defaults: {
			stallName: "Japanease Food",
			description: "This is stall 8",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-06-05.png",
			stallSize: 12.5,
			stallTierNo: 2,
			stallOwner: "Kj7Z8IHo5UlgZYHexjSlxC2XYOEyqGa7",
			rentStatus: true,
			startAt: new Date("2024-09-25 11:03:34.681+08"),
			endAt: new Date("2025-09-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "9" },
		defaults: {
			stallName: "AhChoo Laksa",
			description: "This is stall 9",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-05-53.png",
			stallSize: 11.5,
			stallTierNo: 3,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "10" },
		defaults: {
			stallName: "Dish Rice",
			description: "This is stall 10",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-05-25.png",
			stallSize: 14.5,
			stallTierNo: 1,
			stallOwner: "xTSdZUUynTHmq8G_bmV-L",
			rentStatus: true,
			startAt: new Date("2024-07-25 11:03:34.681+08"),
			endAt: new Date("2025-07-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "11" },
		defaults: {
			stallName: "Rice Stall",
			description: "This is stall 11",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-05-17.png",
			stallSize: 10.5,
			stallTierNo: 2,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "12" },
		defaults: {
			stallName: "Kueh Chap",
			description: "This is stall 12",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-05-03.png",
			stallSize: 13.0,
			stallTierNo: 3,
			stallOwner: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			rentStatus: true,
			startAt: new Date("2024-06-25 11:03:34.681+08"),
			endAt: new Date("2025-06-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "13" },
		defaults: {
			stallName: "Ai Ling Cakoi",
			description: "This is stall 13",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-04-31.png",
			stallSize: 10.0,
			stallTierNo: 1,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "14" },
		defaults: {
			stallName: "Chicken Rice",
			description: "This is stall 14",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-04-19.png",
			stallSize: 11.0,
			stallTierNo: 2,
			stallOwner: "Kj7Z8IHo5UlgZYHexjSlxC2XYOEyqGa7",
			rentStatus: true,
			startAt: new Date("2024-05-25 11:03:34.681+08"),
			endAt: new Date("2025-05-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "15" },
		defaults: {
			stallName: "Vegetarian Food",
			description: "This is stall 15, Provide vegetarian food",
			stallImage:
				"https://raw.githubusercontent.com/hong-tm/blog-image/main/Snipaste_2024-12-30_03-03-56.png",
			stallSize: 15.0,
			stallTierNo: 3,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "16" },
		defaults: {
			stallName: "Stall 16",
			description: "This is stall 16",
			stallImage: "https://via.placeholder.com/150",
			stallSize: 14.0,
			stallTierNo: 1,
			stallOwner: "uf1Ct1N6fYtj1g231BPsoHodHZCLlxoF",
			rentStatus: true,
			startAt: new Date("2024-04-25 11:03:34.681+08"),
			endAt: new Date("2025-04-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "17" },
		defaults: {
			stallName: "Stall 17",
			description: "This is stall 17",
			stallImage: "https://via.placeholder.com/150",
			stallSize: 13.5,
			stallTierNo: 2,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "18" },
		defaults: {
			stallName: "Stall 18",
			description: "This is stall 18",
			stallImage: "https://via.placeholder.com/150",
			stallSize: 12.5,
			stallTierNo: 3,
			stallOwner: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			rentStatus: true,
			startAt: new Date("2024-03-25 11:03:34.681+08"),
			endAt: new Date("2025-03-25 11:03:34.681+08"),
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "19" },
		defaults: {
			stallName: "Stall 19",
			description: "This is stall 19",
			stallImage: "https://via.placeholder.com/150",
			stallSize: 13.5,
			stallTierNo: 1,
			rentStatus: false,
		},
	});

	Stall.findOrCreate({
		where: { stallNumber: "20" },
		defaults: {
			stallName: "Stall 20",
			description: "This is stall 20",
			stallImage: "https://via.placeholder.com/150",
			stallSize: 11.5,
			stallTierNo: 2,
			rentStatus: false,
		},
	});
}

function initUser() {
	user.findOrCreate({
		where: { id: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA" },
		defaults: {
			name: "hong1120",
			email: "asuszen48319@gmail.com",
			emailVerified: true,
			image:
				"https://lh3.googleusercontent.com/a/ACg8ocKbx-tGRMBX4S2e06yoHrR4rj8JPy3eOdNmXcAXevlFZ84XyGZ0=s96-c",
			createdAt: new Date("2024-12-25 11:03:34.681+08"),
			updatedAt: new Date("2024-12-25 11:03:34.681+08"),
			role: "admin",
			banned: false,
			phone: "0149934699",
		},
	});

	user.findOrCreate({
		where: { id: "Kj7Z8IHo5UlgZYHexjSlxC2XYOEyqGa7" },
		defaults: {
			name: "hong lenovo",
			email: "lenovoliew4699@gmail.com",
			emailVerified: true,
			image:
				"https://lh3.googleusercontent.com/a/ACg8ocKQAFGW9t9CBN202QfM0-TkP3vZ2IImysT5rfKtCMMSq18_PA=s96-c",
			createdAt: new Date("2024-12-25 11:03:34.681+08"),
			updatedAt: new Date("2024-12-25 11:03:34.681+08"),
			role: "rental",
			banned: false,
			banReason: "No reason",
			banExpires: new Date("2024-12-27 07:19:11.062+08"),
			phone: "018783669",
		},
	});

	user.findOrCreate({
		where: { id: "uf1Ct1N6fYtj1g231BPsoHodHZCLlxoF" },
		defaults: {
			name: "天命成君",
			email: "hong1234day@gmail.com",
			emailVerified: true,
			image:
				"https://lh3.googleusercontent.com/a/ACg8ocLfiVRotKZMxyNy1fv3shgYqhskLehXrSoO0-en4g-95Zph6gJB=s96-c",
			createdAt: new Date("2024-12-25 11:03:34.681+08"),
			updatedAt: new Date("2024-12-25 11:03:34.681+08"),
			role: "rental",
			banned: false,
			phone: "012345678",
		},
	});

	user.findOrCreate({
		where: { id: "xTSdZUUynTHmq8G_bmV-L" },
		defaults: {
			name: "hocetev356",
			email: "hocetev356@chansd.com",
			emailVerified: true,
			createdAt: new Date("2024-12-26 22:39:18.885+00"),
			updatedAt: new Date("2024-12-26 22:39:18.885+00"),
			role: "user",
		},
	});
}

function initAccount() {
	account.findOrCreate({
		where: { id: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA" },
		defaults: {
			accountId: "111567069261436734214",
			userId: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			providerId: "google",
			accessToken:
				"ya29.a0ARW5m777kADIFgzRdV7sK1UWSNZauKmXg9V41UhqWqOlDueqjfb0G53HLr35NyM7MgMqNa5l0wwrOahhM7EZ40IdyBuaJVcNFADmZT2qOgAWhLM3Vg905XEvwjUx73q-5-ECwMVyC4i1hJrgELX2HPxVWvVmFObueRMaCgYKAT8SARMSFQHGX2MiN0VadJKd6Dnuwhv4GYC43A0170",
			idToken:
				"eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxYjhmY2NiMmU1MjI1M2IxMzMxMzhhY2YwZTU2NjMyZjA5OTU3ZWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTE1NjcwNjkyNjE0MzY3MzQyMTQiLCJlbWFpbCI6ImFzdXN6ZW40ODMxOUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IktHM0RaT3lfYlRIYkFqcWVLVS1OOEEiLCJuYW1lIjoiSG9uZyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLYngtdEdSTUJYNFMyZTA2eW9IclI0cmo4SlB5M2VPZE5tWGNBWGV2bEZaODRYeUdaMD1zOTYtYyIsImdpdmVuX25hbWUiOiJIb25nIiwiaWF0IjoxNzM1MTc1MzE1LCJleHAiOjE3MzUxNzg5MTV9.Wmnq7mkIkpQ372xu9QWTtLACpb7KQJuVv_thyDqk1UaznJBSBg_Nk7MqnQ9abzeVDMnPUG4NjeeEDQO9KSEwoeiNrlFH2L1fUNWtbU2NR_W1mZKrvxIbWw-xcToxv0uMb14Xu-wy8fo3xCdlsv_ECjb9hrEB4R_ae405HS_HiqczRL9KBCy5kJDe4c4t0RXnHwLL0DryHs8AZMo5sOD9_K660KLKMHHr3snoGMOpmtDCQ760b89aWyz11qQQzRA2bNbShC4yR-s6F7QimrUOwuNHrziVR0e_dPQCrpBZmWvZr7ZsMtJ1O_lN2dpwpn3PBTXaGrxrzN9UL4P27Rtvsw",
			accessTokenExpiresAt: new Date("2024-12-26 10:08:34.664+08"),
			scope:
				"openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile",
			createdAt: new Date("2024-12-25 11:03:34.683+08"),
			updatedAt: new Date("2024-12-25 11:03:34.683+08"),
		},
	});

	account.findOrCreate({
		where: { id: "g0wW9SFKe7acDFBYykYDryDQPhERaEUF" },
		defaults: {
			accountId: "113623043773945210375",
			userId: "Kj7Z8IHo5UlgZYHexjSlxC2XYOEyqGa7",
			providerId: "google",
			accessToken:
				"ya29.a0ARW5m75M4wR0L3mCyD2HJUEqIoHGORLi6Dn517yqNNsLMP0KUg95GMpijNQHqnbSkBaS80sr0F6BE-_cQ4TTXJU7N8PW3x8S_xpSJKV3KqyWYowAl1o2ypFEOuAizpmgs-alD0vpV3DDxvg9jm5kVB8E-x7AIn3Kxw4aCgYKAWASARISFQHGX2MiYmBkTEvDJlC9ATzWM8OW5Q0170",
			idToken:
				"eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxYjhmY2NiMmU1MjI1M2IxMzMxMzhhY2YwZTU2NjMyZjA5OTU3ZWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM2MjMwNDM3NzM5NDUyMTAzNzUiLCJlbWFpbCI6Imxlbm92b2xpZXc0Njk5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiWUFEX2FwQ0tBdXJTYzVPblJTeFI4dyIsIm5hbWUiOiJob25nIGxlbm92byIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLUUFGR1c5dDlDQk4yMDJRZk0wLVRrUDN2WjJJSW15c1Q1cmZLdENNTVNxMThfUEE9czk2LWMiLCJnaXZlbl9uYW1lIjoiaG9uZyIsImZhbWlseV9uYW1lIjoibGVub3ZvIiwiaWF0IjoxNzM1MDk4OTA4LCJleHAiOjE3MzUxMDI1MDh9.mkBJ8eLVOAaeQOYBvgmP9sIeazxPe1YoBWwEdBWo1ynO82vhFcPzawd0usU_yYBClNluNZ5s86GXXw_TI-GlWjlOLzFvLbWCXMw6JyAtO6vBkWF4KF80gTYZwLkQt6K4ae9E7Zsq1U5YyGknNlFMh7Q8bO7KZIn_iWg_G6tRduRxZplwVN_mgAVljHqUVsAuJPsRqg0meZ_3BVcxtDgDU1dfoU9rqRBiFjZlRfwRVsGNtughYLwIxOKg_bq9T2T_NJb_GwuILbCOgppDWWk97uEMKdmdXE4df1yrGaNgUWbmz3YllekyyQvS_1A_shjj1CriQufBG_1xPjK-gkd3Ig",
			accessTokenExpiresAt: new Date("2024-12-25 12:55:07.103+08"),
			scope:
				"openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile",
			createdAt: new Date("2024-12-25 11:55:08.106+08"),
			updatedAt: new Date("2024-12-25 11:55:08.106+08"),
		},
	});

	account.findOrCreate({
		where: { id: "uf1Ct1N6fYtj1g231BPsoHodHZCLlxoF" },
		defaults: {
			accountId: "113149278347686435807",
			userId: "fN5GPoCR3JbqzJQqIFcOjnlPBdE0F3HA",
			providerId: "google",
			accessToken:
				"ya29.a0ARW5m74okdejO_ZUrztwK-UDxfXKgffbgfIzRcnnmC4xE9dwGUu4ekChj3EwVgtCfj2MhdgjBHnOWldeD3SHekEwDEd26uI9dRt3lx9VlGOU7vUe5HaKqTZEQhfURu3s048RHR2LunLImhCTsjFMjFtZ2SkLLCisOfwaCgYKAaMSARISFQHGX2MiI9MMGOpXrMNcLSspxU3xCA0170",
			idToken:
				"eyJhbGciOiJSUzI1NiIsImtpZCI6IjMxYjhmY2NiMmU1MjI1M2IxMzMxMzhhY2YwZTU2NjMyZjA5OTU3ZWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5NTk3Nzk2MTIzMTgtY2lndGIzMzFwa2hrajdvNXFmam1uMWRibHAybmEyNmMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMxNDkyNzgzNDc2ODY0MzU4MDciLCJlbWFpbCI6ImhvbmcxMjM0ZGF5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoibHNaUDgxLVo4S1lwd0tIcmJqRWt1QSIsIm5hbWUiOiLlpKnlkb3miJDlkJsiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTGZpVlJvdEtaTXh5TnkxZnYzc2hnWXFoc2tMZWhYclNvTzAtZW40Zy05NVpwaDZnSkI9czk2LWMiLCJnaXZlbl9uYW1lIjoi5aSp5ZG95oiQ5ZCbIiwiaWF0IjoxNzM1MTcyMjMxLCJleHAiOjE3MzUxNzU4MzF9.KRYRv8J_qlPo8LvnI2_HIYCzN_IsbK_ZYfIK6ZJbP5xRwbn-x3jitxgf-ka92KHHqXDIQKLlBbTS7aywI54gjTmPcOVABcTG3pzP-pnA8-GgNbkuDvqA0lxbCjcDmRvlSLeg9elTZPSjDJ8NZ1ztVUBcxyNkaD7p31LKtBOfvvw6kjnV5LuFYII8BanMQ3Hh4Raa9ygiStsU_O6zX8tS781s7g0BJ4l8wV0es6gILdUoQbC49WSEKn7syTEa0hwWIqpat5sXGnPZ4w31eJ86PM28YkjTbbyc0T39rCYuA8ufr_VkyiMMQAzstJ8YMJoTXuW8V-4V7aDfEoWffMNwJw",
			accessTokenExpiresAt: new Date("2024-12-26 09:17:10.346+08"),
			scope:
				"https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/userinfo.profile,openid",
			createdAt: new Date("2024-12-26 08:17:11.35+08"),
			updatedAt: new Date("2024-12-26 08:17:11.35+08"),
		},
	});

	account.findOrCreate({
		where: { id: "xTSdZUUynTHmq8G_bmV-L" },
		defaults: {
			accountId: "xTSdZUUynTHmq8G_bmV-L",
			userId: "xTSdZUUynTHmq8G_bmV-L",
			providerId: "credential",
			password:
				"0975692c5a3d342e6a14e3ce30603a06:546abb82b7e4a911f2636d6b360d8abaaacbfd35d03e20b925c3810a6fa09f0777e1432dbe037153ff5942f474c9645afc6c108283ee36fadb90293a8d30bebf",
			createdAt: new Date("2024-12-26 22:39:19.233+00"),
			updatedAt: new Date("2024-12-26 22:39:19.233+00"),
		},
	});
}

function initStallTier() {
	StallTier.findOrCreate({
		where: {
			tierId: 1,
			tierName: "Low",
			tierPrice: 50.0,
		},
	});

	StallTier.findOrCreate({
		where: {
			tierId: 2,
			tierName: "Medium",
			tierPrice: 80.0,
		},
	});

	StallTier.findOrCreate({
		where: {
			tierId: 3,
			tierName: "High",
			tierPrice: 100.0,
		},
	});
}

function initFeeedback() {
	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Good",
			stall: 1,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Nice",
			stall: 12,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 3,
			feedbackContent: "Not bad",
			stall: 20,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 2,
			feedbackContent: "Food was cold and service was slow",
			stall: 5,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Amazing food quality and friendly staff",
			stall: 8,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 3,
			feedbackContent: "Reasonable prices and good portions",
			stall: 15,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 1,
			feedbackContent: "Very disappointed with cleanliness",
			stall: 3,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Best noodles in the food court",
			stall: 10,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 2,
			feedbackContent: "Long waiting time, need more staff",
			stall: 18,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 3,
			feedbackContent: "Decent food but a bit pricey",
			stall: 7,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Fresh ingredients and great taste",
			stall: 13,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 1,
			feedbackContent: "Poor food quality and rude service",
			stall: 16,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 3,
			feedbackContent: "Good variety of dishes",
			stall: 4,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 2,
			feedbackContent: "Food was mediocre and overpriced",
			stall: 19,
		},
	});

	Feedback.findOrCreate({
		where: {
			happiness: 4,
			feedbackContent: "Excellent service and tasty food",
			stall: 11,
		},
	});
}
