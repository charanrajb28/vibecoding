'use client';

import * as React from 'react';
import GitImportForm from '@/components/new-project/git-import-form';
import TemplateCard from '@/components/new-project/template-card';
import CreateProjectDialog from '@/components/new-project/create-project-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templates, type Template } from '@/lib/placeholder-data';

export default function NewProjectPage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <>
      <div className="container py-8 mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Create a New Project</h1>
          <p className="text-muted-foreground mt-2">Start from a template or import your own code.</p>
        </div>

        <Tabs defaultValue="templates" className="w-[80%]  mx-auto">
          <TabsList className="grid max-w-md mx-auto w-full grid-cols-2">
            <TabsTrigger value="templates">Choose a Template</TabsTrigger>
            <TabsTrigger value="import">Import from Git</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onClick={() => handleTemplateClick(template)}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="import" className="mt-8">
            <GitImportForm />
          </TabsContent>
        </Tabs>
      </div>

      {selectedTemplate && (
         <CreateProjectDialog 
            template={selectedTemplate}
            isOpen={isDialogOpen}
            onOpenChange={handleDialogClose}
        />
      )}
    </>
  );
}
