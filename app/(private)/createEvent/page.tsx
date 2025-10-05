"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";

// Icons
import {
    Calendar as CalendarIcon,
    Loader2,
    UploadCloud,
    X,
    Video,
    Image as ImageIcon,
    Menu,
} from "lucide-react";

// Utils & API
import { cn } from "@/lib/utils";
import { createEventFn } from "@/constants/api";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/Sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Validation Schema ---
const eventValidationSchema = Yup.object({
    title: Yup.string()
        .min(3, "Title must be at least 3 characters")
        .required("Event title is required"),
    description: Yup.string()
        .min(10, "Description must be at least 10 characters")
        .required("Description is required"),
    location: Yup.string().required("Location is required"),
    dateRange: Yup.object({
        from: Yup.date().required("A start date is required"),
        to: Yup.date(),
    }).required("Event date is required"),
    price: Yup.number()
        .transform(value => (isNaN(value) ? 0 : value))
        .min(0, "Price must be a positive number")
        .required("Price is required"),
    currency: Yup.string().required("Currency is required"),
    category: Yup.string(),
    imageFile: Yup.mixed<File>().nullable(),
    videoFile: Yup.mixed<File>().nullable(),
});

// --- Main Component ---
const CreateEventPage = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [calendarMonths, setCalendarMonths] = useState(1);

    const { mutate, isPending } = useMutation({
        mutationKey: ["createEvent"],
        mutationFn: createEventFn,
        onSuccess: (data) => {
            toast.success(data.message || "Event created successfully!");
            formik.resetForm();
            setImagePreview(null);
            setVideoPreview(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create event.");
        },
    });

    const formik = useFormik({
        initialValues: {
            title: "",
            description: "",
            location: "",
            dateRange: {
                from: undefined as Date | undefined,
                to: undefined as Date | undefined,
            },
            imageFile: null as File | null,
            videoFile: null as File | null,
            price: 0,
            currency: 'USD',
            category: '',
        },
        validationSchema: eventValidationSchema,
        onSubmit: (values) => {
            console.log(formik.values)
            const formData = new FormData();
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("location", values.location);
            formData.append("price", values.price);
            formData.append("currency", values.currency);
            formData.append("category", values.category);
            if (values.dateRange.from)
                formData.append("startDate", values.dateRange.from.toISOString());
            if (values.dateRange.to)
                formData.append("endDate", values.dateRange.to.toISOString());
            if (values.imageFile) formData.append("image", values.imageFile);
            if (values.videoFile) formData.append("video", values.videoFile);
            mutate(formData);
        },
    });

    const onDrop = useCallback(
        (acceptedFiles: File[], fieldName: "imageFile" | "videoFile") => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                formik.setFieldValue(fieldName, file);
                const setPreview =
                    fieldName === "imageFile" ? setImagePreview : setVideoPreview;
                setPreview(URL.createObjectURL(file));
            }
        },
        [formik]
    );

    const removeFile = (fieldName: "imageFile" | "videoFile") => {
        formik.setFieldValue(fieldName, null);
        if (fieldName === "imageFile" && imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        } else if (fieldName === "videoFile" && videoPreview) {
            URL.revokeObjectURL(videoPreview);
            setVideoPreview(null);
        }
    };

    const {
        getRootProps: getImageRootProps,
        getInputProps: getImageInputProps,
        isDragActive: isImageDragActive,
    } = useDropzone({
        onDrop: (files) => onDrop(files, "imageFile"),
        maxFiles: 1,
        multiple: false,
    });
    const {
        getRootProps: getVideoRootProps,
        getInputProps: getVideoInputProps,
        isDragActive: isVideoDragActive,
    } = useDropzone({
        onDrop: (files) => onDrop(files, "videoFile"),
        maxFiles: 1,
        multiple: false,
    });

    useEffect(() => {
        const checkSize = () => setCalendarMonths(window.innerWidth < 768 ? 1 : 2);
        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    return (
        <>
            <div className="space-y-4 py-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col p-0">
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">Create a New Event</h1>
                            <p className="text-muted-foreground">
                                Fill out the details to get your event up and running.
                            </p>
                        </div>
                    </div>
                    <Button type="submit" onClick={() => formik.handleSubmit()} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Creating..." : "Create Event"}
                    </Button>
                </div>
                <Separator className="mb-8" />
                <form onSubmit={formik.handleSubmit} noValidate>
                    <div className="flex flex-col flex-wrap gap-4">
                        {/* Left Column */}
                        {/* <div className="lg:col-span-2 space-y-6"> */}
                        <div className="space-y-2 space-x-2 flex flex-col lg:flex-row">
                            <Card className="flex-2/3">
                                <CardHeader>
                                    <CardTitle>Core Details</CardTitle>
                                    <CardDescription>
                                        The essential information about your event.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Event Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="e.g., Summer Tech Conference 2025"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.title}
                                        />
                                        {formik.touched.title && formik.errors.title && (
                                            <p className="text-sm text-destructive">
                                                {formik.errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Tell us more about your event..."
                                            rows={6}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.description}
                                        />
                                        {formik.touched.description &&
                                            formik.errors.description && (
                                                <p className="text-sm text-destructive">
                                                    {formik.errors.description}
                                                </p>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* <div className="lg:col-span-1 space-y-6"> */}
                            <Card className="flex-1/3">
                                <CardHeader>
                                    <CardTitle>Logistics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="e.g., City Convention Center"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.location}
                                        />
                                        {formik.touched.location && formik.errors.location && (
                                            <p className="text-sm text-destructive">
                                                {formik.errors.location}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateRange">Event Dates</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    id="date"
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !formik.values.dateRange.from &&
                                                        "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {formik.values.dateRange.from ? (
                                                        formik.values.dateRange.to ? (
                                                            <>
                                                                {format(
                                                                    formik.values.dateRange.from,
                                                                    "LLL dd, y"
                                                                )}{" "}
                                                                -{" "}
                                                                {format(
                                                                    formik.values.dateRange.to,
                                                                    "LLL dd, y"
                                                                )}
                                                            </>
                                                        ) : (
                                                            format(formik.values.dateRange.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date range</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    initialFocus
                                                    mode="range"
                                                    defaultMonth={formik.values.dateRange.from}
                                                    selected={formik.values.dateRange as DateRange}
                                                    onSelect={(range) =>
                                                        formik.setFieldValue("dateRange", range)
                                                    }
                                                    numberOfMonths={calendarMonths}
                                                    disabled={(date) =>
                                                        date <
                                                        new Date(
                                                            new Date().setDate(new Date().getDate() - 1)
                                                        )
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {formik.touched.dateRange &&
                                            formik.errors.dateRange?.from && (
                                                <p className="text-sm text-destructive">
                                                    {formik.errors.dateRange.from}
                                                </p>
                                            )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="price"
                                                name="price"
                                                type="number"
                                                placeholder="e.g., 25"
                                                min="0"
                                                step="0.01"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.price}
                                            />
                                            <Select
                                                name="currency"
                                                onValueChange={(value) => formik.setFieldValue('currency', value)}
                                                value={formik.values.currency}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="INR">INR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {formik.touched.price && formik.errors.price && (
                                            <p className="text-sm text-destructive">
                                                {formik.errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select name="category" onValueChange={(value) => formik.setFieldValue('category', value)} value={formik.values.category}>
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Technology">Technology</SelectItem>
                                                <SelectItem value="Music">Music</SelectItem>
                                                <SelectItem value="Art">Art</SelectItem>
                                                <SelectItem value="Business">Business</SelectItem>
                                                <SelectItem value="Health">Health & Wellness</SelectItem>
                                                <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                                                <SelectItem value="Sports">Sports & Fitness</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle>Media</CardTitle>
                                <CardDescription>
                                    Upload a banner image and an optional promotional video.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FileUploader
                                    label="Banner Image"
                                    preview={imagePreview}
                                    rootProps={getImageRootProps()}
                                    inputProps={getImageInputProps()}
                                    isDragActive={isImageDragActive}
                                    onRemove={() => removeFile("imageFile")}
                                    icon={ImageIcon}
                                    error={formik.errors.imageFile as string}
                                />
                                <FileUploader
                                    label="Promotional Video"
                                    preview={videoPreview}
                                    rootProps={getVideoRootProps()}
                                    inputProps={getVideoInputProps()}
                                    isDragActive={isVideoDragActive}
                                    onRemove={() => removeFile("videoFile")}
                                    icon={Video}
                                    error={formik.errors.videoFile as string}
                                    isVideo
                                />
                            </CardContent>
                        </Card>
                        {/* </div> */}

                        {/* Right Column */}

                    </div>
                </form>
            </div>
        </>
    );
};

// --- Helper Components ---
const FileUploader = ({
    label,
    preview,
    rootProps,
    inputProps,
    isDragActive,
    onRemove,
    icon: Icon,
    error,
    isVideo = false,
}: any) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        {preview ? (
            <div className="relative group">
                {isVideo ? (
                    <video
                        src={preview}
                        controls
                        className="rounded-md object-cover w-full h-auto max-h-64 border"
                    />
                ) : (
                    <img
                        src={preview}
                        alt="Preview"
                        className="rounded-md object-cover w-full h-auto max-h-64 border"
                    />
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        ) : (
            <div
                {...rootProps}
                className={cn(
                    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md cursor-pointer transition-colors",
                    isDragActive
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50"
                )}
            >
                <input {...inputProps} />
                <div className="p-3 bg-muted rounded-full mb-2">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                    {isDragActive ? "Drop here..." : "Drag & drop or click to upload"}
                </p>
            </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
);

export default CreateEventPage;
