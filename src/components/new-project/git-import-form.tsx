import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch } from "lucide-react";

export default function GitImportForm() {
  return (
    <Card className="max-w-2xl mx-auto border-dashed shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><GitBranch /> Import from a Git Repository</CardTitle>
        <CardDescription>
          Clone a project from GitHub, GitLab, or Bitbucket to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="git-url">Repository URL</Label>
            <Input id="git-url" placeholder="https://github.com/user/repo.git" />
          </div>
          <Button className="w-full sm:w-auto">Import Project</Button>
        </form>
      </CardContent>
    </Card>
  )
}
