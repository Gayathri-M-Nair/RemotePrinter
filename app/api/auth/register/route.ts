import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db, COLLECTIONS } from "@/lib/firebase";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = registerSchema.parse(body);

    // Check if user already exists
    const existingUserSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingUserSnapshot.empty) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    // Create new user document
    const userRef = await db.collection(COLLECTIONS.USERS).add({
      email,
      name,
      pass: hashedPassword,
      phone,
      userid: "", // Will be updated with document ID
    });

    // Update userid with the generated document ID
    await userRef.update({
      userid: userRef.id,
    });

    return NextResponse.json(
      { message: "User created successfully", userId: userRef.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}