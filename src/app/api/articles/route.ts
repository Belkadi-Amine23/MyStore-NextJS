import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as Minio from "minio";

const prisma = new PrismaClient();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!.replace("http://", "").split(":")[0],
  port: Number(process.env.MINIO_ENDPOINT!.split(":")[2]) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const category = formData.get("category") as string;
    const userId = formData.get("userId") ? parseInt(formData.get("userId") as string) : null;
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "L'image est requise" }, { status: 400 });
    }

    // Lire le fichier image sous forme de buffer
    const buffer = Buffer.from(await image.arrayBuffer());
    const fileName = `${Date.now()}_${image.name}`;

    // Upload vers MinIO
    await minioClient.putObject(process.env.MINIO_BUCKET!, fileName, buffer);
    const imageUrl = `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/${fileName}`;

    // Insérer l'article en base de données
    const article = await prisma.article.create({
      data: {
        titre: title,
        description: description,
        famille: category,
        quantité: quantity,
        prix: price,
        remise: 0,
        imageUrl,
        userId,
      },
    });

    return NextResponse.json({ message: "Article créé avec succès", article }, { status: 201 });

  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article :", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
