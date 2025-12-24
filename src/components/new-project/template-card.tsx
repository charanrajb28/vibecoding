'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Template } from '@/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type TemplateCardProps = {
  template: Template;
  onClick: () => void;
};

export default function TemplateCard({ template, onClick }: TemplateCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === template.imageId);

  return (
    <Card 
      className="h-full hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col hover:scale-105 ease-in cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          {image && (
            <Image
              src={image.imageUrl}
              alt={template.name}
              width={56}
              height={56}
              className="rounded-lg"
              data-ai-hint={image.imageHint}
            />
          )}
          <div>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
    </Card>
  );
}
