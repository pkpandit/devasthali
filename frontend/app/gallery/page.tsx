import React from "react";
import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";
import { getPublicGallery } from "@/lib/api/gallery";

export const metadata: Metadata = {
  title: "Campus Photo Gallery & Student Life | Devasthaly",
  description:
    "Explore photo albums of campus infrastructure, student activities, science exhibitions, sports day, and cultural festivals at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
};

export default async function GalleryPage() {
  const { albums } = await getPublicGallery();
  return <GalleryClient initialAlbums={albums} />;
}
