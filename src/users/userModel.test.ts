import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { pool } from "../db/connection.ts";
import {
  insertUser,
  selectUser,
  updateUser,
  updateUserLastLogin
} from "./userModel";
import type { NewUser } from "./userTypes.ts";
import { AppError } from "../utils/AppError.ts";

const TEST_USER_1: NewUser = {
  nickname: "testuser",
  fullName: "Test User",
  email: "testuser@example.com",
  password: "securepassword",
  bio: "This is a test user",
  avatarId: 1,
  personalityId: 1
};
const TEST_USER_2: NewUser = {
  nickname: "testuser2",
  fullName: "Test User2",
  email: "testuser2@example.com",
  password: "securepassword2",
  bio: "This is another test user",
  avatarId: 2,
  personalityId: 2
};
beforeEach(async () => {
  await pool.query("TRUNCATE TABLE users RESTART IDENTITY;");
  await insertUser(TEST_USER_1);
});
afterEach(async () => {
  await pool.query("TRUNCATE TABLE users RESTART IDENTITY;");
});

describe("User Model Tests", () => {
  it("Should insert a new user and return an id", async () => {
    const result = await insertUser(TEST_USER_2);
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });
  it("Should select user by email correctly", async () => {
    const user = await selectUser(TEST_USER_1.email);
    expect(user).not.toBeNull();
    expect(user?.email).toBe(TEST_USER_1.email);
  });
  it("Should select user by nickname correctly", async () => {
    const user = await selectUser(undefined, undefined, 'testuser');
    expect(user).not.toBeNull();
    expect(user?.nickname).toBe(TEST_USER_1.nickname);
  });
  it("Should select user by id correctly", async () => {
    const inserted = await insertUser({
      nickname: "anotheruser2",
      fullName: "Another User",
      email: "another@example.com2",
      password: "password123",
    });
    const user = await selectUser(undefined, inserted.id);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(inserted.id);
  });
  it("Should handle optional fields correctly", async () => {
    const newUser: NewUser = {
      nickname: "optionaluser",
      fullName: "Optional User",
      email: "optionaluser@example.com",
      password: "optionalpassword",
    };
    const inserted = await insertUser(newUser);
    expect(inserted).toHaveProperty("id");
  });
  it("Should return null for nonexistent email", async () => {
    const user = await selectUser("nonexistent@example.com");
    expect(user).toBeNull();
  });
  it("Should return null for nonexistent user id", async () => {
    const user = await selectUser(undefined, 9999);
    expect(user).toBeNull();
  });
  it("Should throw AppError on duplicate email", async () => {
    expect(insertUser(TEST_USER_1)).rejects.toThrow(AppError);
  });
  it("Should throw AppError on duplicate nickname", async () => {
    const userWithSameNickname = {
      ...TEST_USER_1,
      email: "newemail@example.com",
    };
    expect(insertUser(userWithSameNickname)).rejects.toThrow(AppError);
  });
  it("Should update user last login", async () => {
    const user = await selectUser(TEST_USER_1.email);
    expect(user).not.toBeNull();
    const previous = user!.lastLogin;
    await updateUserLastLogin(user!.id);
    const updatedUser = await selectUser(TEST_USER_1.email);
    expect(updatedUser?.lastLogin).not.toBeNull();
    expect(updatedUser?.lastLogin).not.toEqual(previous);
  });
  it("Should update user details", async () => {
    const user = await selectUser(TEST_USER_1.email);
    expect(user).not.toBeNull();
    const updates = {
      fullName: "Updated Name",
      bio: "Updated bio",
    };
    const updatedUser = await updateUser(user!.id, updates);
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.fullName).toBe("Updated Name");
    expect(updatedUser?.bio).toBe("Updated bio");
    expect(updatedUser?.email).toBe(user!.email);
    expect(updatedUser?.id).toBe(user!.id);
  });
  it("Should return null when updating nonexistent user", async () => {
    const updatedUser = await updateUser(9999, { fullName: "No User" });
    expect(updatedUser).toBeNull();
  });
});