import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createCourseWithImage } from "@/services/api";

interface CreateCourseFormProps {
  organizationId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateCourseForm = ({ organizationId, onSuccess, onCancel }: CreateCourseFormProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("organizationId", organizationId);
      formData.append("isPublic", isPublic.toString());
      
      if (introVideoUrl) {
        formData.append("introVideoUrl", introVideoUrl);
      }
      
      if (image) {
        formData.append("image", image);
      }

      await createCourseWithImage(formData);
      toast.success("Course created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter course title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter course description"
          required
        />
      </div>

      <div>
        <Label htmlFor="introVideoUrl">Intro Video URL</Label>
        <Input
          id="introVideoUrl"
          value={introVideoUrl}
          onChange={(e) => setIntroVideoUrl(e.target.value)}
          placeholder="Enter intro video URL"
        />
      </div>

      <div>
        <Label>Course Image</Label>
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="isPublic">Make course public</Label>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </form>
  );
};
