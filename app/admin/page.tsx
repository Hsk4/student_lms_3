"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, FileCheck, Clock, TrendingUp, GripVertical } from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
    const [cards, setCards] = useState([
        { id: "enrolled", title: "Total Enrolled", value: "1,240", sub: "+12% from last month", icon: Users, color: "text-emerald-600" },
        { id: "active", title: "Active Courses", value: "24", sub: "Across 6 Educational Boards", icon: BookOpen, color: "text-emerald-600" },
        { id: "pending", title: "Pending Submissions", value: "18", sub: "Awaiting Instructor Review", icon: FileCheck, color: "text-amber-600" },
        { id: "mock", title: "Mock Papers Published", value: "42", sub: "Sindh, Aga Khan & O/A Levels", icon: Clock, color: "text-emerald-600" },
    ]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData("index", index.toString());
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData("index"));
        if (sourceIndex === targetIndex) return;
        const newCards = [...cards];
        const [movedCard] = newCards.splice(sourceIndex, 1);
        newCards.splice(targetIndex, 0, movedCard);
        setCards(newCards);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-sm text-muted-foreground">
                        Real-time curriculum performance and enrollment status across all educational boards.
                    </p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Bento Mode Enabled
                </Badge>
            </div>

            {/* Top Metric Cards (Bento Style Draggable) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={handleDragOver}
                        className="cursor-move group relative"
                    >
                        <Card className="h-full transition-shadow hover:shadow-md border-transparent hover:border-emerald-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                    <GripVertical className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className={`text-xs mt-1 ${card.id === 'pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                    {card.id === 'enrolled' && <TrendingUp className="w-3 h-3 inline mr-1" />}
                                    {card.sub}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Middle Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Analytics / Distribution Widget */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Curriculum Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Sindh Board (Commerce)</span>
                                <span className="text-muted-foreground">350 Students</span>
                            </div>
                            <Progress value={75} className="h-2 bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>O Levels (Accounting & Economics)</span>
                                <span className="text-muted-foreground">280 Students</span>
                            </div>
                            <Progress value={60} className="h-2 bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>BCOM / Advance Accounting</span>
                                <span className="text-muted-foreground">190 Students</span>
                            </div>
                            <Progress value={40} className="h-2 bg-muted" />
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Action & System Health Card */}
                <Card className="bg-emerald-950 text-white flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold text-emerald-300">Course Verification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        <p className="text-xs text-emerald-100 leading-relaxed">
                            All board syllabi for the 2026 academic batch have been synchronized with Mongoose schemas and Clerk B2B roles.
                        </p>
                        <div className="pt-4 border-t border-emerald-800 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-tighter">System Status</span>
                                <span className="text-xs text-emerald-200 font-semibold">OPERATIONAL</span>
                            </div>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-black border-none">Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}