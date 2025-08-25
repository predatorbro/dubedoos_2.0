// app/api/upload/route.ts
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        // Handle single/multiple uploads
        const uploadResults = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new Promise((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        )
                        .end(buffer);
                });
            })
        );

        return NextResponse.json({ success: true, results: uploadResults });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed", details: error.message },
            { status: 500 }
        );
    }
} 