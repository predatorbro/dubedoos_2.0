// app/api/delete-image/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const { public_id } = await req.json();

        if (!public_id) {
            return NextResponse.json(
                { error: "Missing public_id" },
                { status: 400 }
            );
        }

        // Delete image by public_id
        const result = await cloudinary.uploader.destroy(public_id);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Failed to delete image" },
            { status: 500 }
        );
    }
}
