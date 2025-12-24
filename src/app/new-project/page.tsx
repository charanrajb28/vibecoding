import GitImportForm from '@/components/new-project/git-import-form';
import TemplateCard from '@/components/new-project/template-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templates } from '@/lib/placeholder-data';

export default function NewProjectPage() {
  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create a New Project</h1>
        <p className="text-muted-foreground mt-2">Start from a template or import your own code.</p>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid max-w-md mx-auto w-full grid-cols-2">
          <TabsTrigger value="templates">Choose a Template</TabsTrigger>
          <TabsTrigger value="import">Import from Git</TabsTrigger>
        </TabsList>
        <TabsContent value="templates" className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="import" className="mt-8">
          <GitImportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
