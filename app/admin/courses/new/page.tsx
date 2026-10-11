"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2 } from "lucide-react";
import { BoardType } from "@/app/models/course";

export default function NewCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [subjectInput, setSubjectInput] = useState("");

    const addSubject = () => {
        if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
            setSubjects([...subjects, subjectInput.trim()]);
            setSubjectInput("");
        }
    };

    const removeSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const board = formData.get("board") as BoardType;
            const levelOrGrade = formData.get("levelOrGrade") as string;

            if (subjects.length === 0) {
                alert("Please add at least one subject");
                setLoading(false);
                return;
            }

            const result = await createCourse({
                board,
                levelOrGrade,
                subjects,
            });

            if (result.success) {
                router.push("/admin/courses");
            }
        } catch (error: any) {
            alert(error.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Create New Course</h1>
                <p className="text-sm text-muted-foreground">Define a new board, grade level, and subject list.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="board">Educational Board</Label>
                            <select
                                id="board"
                                name="board"
                                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            >
                                <option value="Sindh Board">Sindh Board</option>
                                <option value="Aga Khan Board">Aga Khan Board</option>
                                <option value="O Levels">O Levels</option>
                                <option value="A Levels">A Levels</option>
                                <option value="BCOM">BCOM</option>
                                <option value="Bachelors">Bachelors</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="levelOrGrade">Level or Grade</Label>
                            <Input
                                id="levelOrGrade"
                                name="levelOrGrade"
                                placeholder="e.g. 1st Year (Only Commerce), 9th, Advance Accounting"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Subjects</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={subjectInput}
                                    onChange={(e) => setSubjectInput(e.target.value)}
                                    placeholder="e.g. Accounting"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addSubject();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={addSubject} variant="secondary">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {subjects.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-100">
                                        {s}
                                        <button type="button" onClick={() => removeSubject(i)}>
                                            <X className="w-3 h-3 hover:text-emerald-900" />
                                        </button>
                                    </span>
                                ))}
                                {subjects.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">No subjects added yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Course Offering
                            </Button>
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}