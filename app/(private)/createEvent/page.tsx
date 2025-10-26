"use client";

import React, { useState, useCallback, useEffect } from "react";
import "react-quill-new/dist/quill.snow.css";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import CommonInput from "@/components/common/CommonInput";
import CommonTextArea from "@/components/common/CommonTextArea";
import CommonCard from "@/components/common/CommonCard";
import CommonDateTimePicker from "@/components/common/CommonDateTimePicker";
import PriceInput from "@/components/common/PriceInput";
import CommonSelect from "@/components/common/CommonSelect";
import FileUploader from "@/components/common/FileUploader";
import TextEditor from "@/components/common/TextEditor";
import { toUTCISOString } from "@/lib/commonFunction";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// --- Validation Schema ---
const eventValidationSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .required("Event title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  body: Yup.string()
    .min(20, "Body must be at least 20 characters")
    .required("Body is required"),
  location: Yup.string().required("Location is required"),
  dateRange: Yup.object({
    from: Yup.date().required("A start date is required"),
    to: Yup.date(),
  }).required("Event date is required"),
  startTime: Yup.string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .required("Start time is required"),
  endTime: Yup.string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)")
    .required("End time is required"),
  price: Yup.number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .min(0, "Price must be a positive number")
    .required("Price is required"),
  currency: Yup.string().required("Currency is required"),
  category: Yup.string(),
  imageFile: Yup.mixed<File>().nullable(),
  videoFile: Yup.mixed<File>().nullable(),
});

const CurrencyOptions = [
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "INR", value: "INR" },
  { label: "AUD", value: "AUD" },
  { label: "CHF", value: "CHF" },
  { label: "CNY", value: "CNY" },
  { label: "DKK", value: "DKK" },
  { label: "GBP", value: "GBP" },
  { label: "HKD", value: "HKD" },
  { label: "JPY", value: "JPY" },
  { label: "NZD", value: "NZD" },
  { label: "RUB", value: "RUB" },
  { label: "SGD", value: "SGD" },
  { label: "SEK", value: "SEK" },
  { label: "TWD", value: "TWD" },
  { label: "ZAR", value: "ZAR" },
  { label: "AED", value: "AED" },
  { label: "ARS", value: "ARS" },
  { label: "BRL", value: "BRL" },
  { label: "CAD", value: "CAD" },
  { label: "CLP", value: "CLP" },
];

const CategoryOptions = [
  { label: "General", value: "General" },
  { label: "Music", value: "Music" },
  { label: "Sports", value: "Sports" },
  { label: "Technology", value: "Technology" },
  { label: "Art", value: "Art" },
  { label: "Fashion", value: "Fashion" },
  { label: "Food", value: "Food" },
  { label: "Travel", value: "Travel" },
  { label: "Health", value: "Health" },
  { label: "Education", value: "Education" },
  { label: "Business", value: "Business" },
  { label: "Photography", value: "Photography" },
  { label: "Cultural", value: "Cultutral" },
];

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
      body: "",
      location: "",
      dateRange: {
        from: null as Date | null,
        to: null as Date | null,
      },
      startTime: "00:00",
      endTime: "00:00",
      imageFile: null as File | null,
      videoFile: null as File | null,
      price: 0,
      currency: "USD",
      category: "",
    },
    validationSchema: eventValidationSchema,
    onSubmit: (values) => {
      const formData = new FormData();

      const combineDateTime = (date: Date, time: string): Date => {
        const [hours, minutes] = time.split(":").map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
      };

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("body", values.body);
      formData.append("location", values.location);
      formData.append("price", values.price);
      formData.append("currency", values.currency);
      formData.append("category", values.category);
      if (values.dateRange.from) {
        // const startDate = combineDateTime(
        //   values.dateRange.from,
        //   values.startTime
        // );
        // const endDate = combineDateTime(
        //   values.dateRange.to || values.dateRange.from,
        //   values.endTime
        // );
        formData.append("startDate", toUTCISOString(values.dateRange.from));
      }
      if (values.dateRange.to) {
        // const startDate = combineDateTime(
        //   values.dateRange.from,
        //   values.startTime
        // );
        // const endDate = combineDateTime(
        //   values.dateRange.to || values.dateRange.from,
        //   values.endTime
        // );
        formData.append("endDate", toUTCISOString(values.dateRange.to));
      }
      if (values.imageFile) formData.append("image", values.imageFile);
      if (values.videoFile) formData.append("video", values.videoFile);
      console.log(values);
      mutate(formData);
      console.log(formData.get("startDate"));
      console.log(formData.get("endDate"));
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
    <div className="space-y-4 py-2 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex md:hidden">
            Create a New Event
          </h1>
          <p className="text-muted-foreground">
            Fill out the details to get your event up and running.
          </p>
        </div>
        <Button
          type="submit"
          onClick={() => formik.handleSubmit()}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Creating..." : "Create Event"}
        </Button>
      </div>
      <Separator className="mb-8" />
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="flex flex-col flex-wrap gap-4">
          {/* Left Column */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Core Details Card */}
            <CommonCard
              className="w-full lg:w-2/3"
              title="Core Details"
              description="The essential information about your event."
              content={
                <>
                  <CommonInput
                    label="Event Title"
                    name="title"
                    type="text"
                    placeholder="e.g., Summer Tech Conference 2025"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.title}
                    error={formik.errors.title}
                    touched={formik.touched.title}
                  />
                  <CommonTextArea
                    title="Description"
                    name="description"
                    placeholder="Tell us more about your event..."
                    rows={6}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                    touched={formik.touched.description}
                    error={formik.errors.description}
                  />
                </>
              }
            />

            {/* Logistics Card */}
            <CommonCard
              title="Logistics"
              // description=""
              className="w-full lg:w-1/3"
              content={
                <>
                  <CommonInput
                    label="Location"
                    type="text"
                    name="location"
                    placeholder="e.g., City Convention Center"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.location}
                    error={formik.errors.location}
                    touched={formik.touched.location}
                  />
                  <CommonDateTimePicker
                    name="dateRange"
                    value={[
                      formik.values.dateRange.from,
                      formik.values.dateRange.to,
                    ]}
                    onChange={(dates) => {
                      formik.setFieldValue("dateRange", {
                        from: dates[0],
                        to: dates[1],
                      });
                    }}
                    label="Event Dates"
                    error={formik.errors.dateRange?.from}
                    touched={formik.touched.dateRange?.from}
                    onValidationError={(error) =>
                      formik.setFieldError("dateRange", error)
                    }
                  />
                  <PriceInput
                    label="Price"
                    name="price"
                    placeholder={["e.g., 25", "Currency"]}
                    currency={formik.values.currency}
                    value={formik.values.price}
                    onCurrencyChange={(val) =>
                      formik.setFieldValue("currency", val)
                    }
                    onPriceChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    currencyName="currency"
                    error={formik.errors.price}
                    touched={formik.touched.price}
                    options={CurrencyOptions}
                  />
                  <CommonSelect
                    label="Category"
                    name="category"
                    placeholder="Select a category"
                    value={formik.values.category}
                    onChange={(val) => formik.setFieldValue("category", val)}
                    onBlur={() => formik.setFieldTouched("category", true)}
                    error={formik.errors.category}
                    touched={formik.touched.category}
                    options={CategoryOptions}
                  />
                </>
              }
            />
          </div>

          {/* Media */}
          <CommonCard
            title="Media"
            description="Upload a banner image and an optional promotional video."
            contentClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
            content={
              <>
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
              </>
            }
          />

          {/* body */}
          <CommonCard
            title="Event Body"
            description="Provide a detailed description, agenda, or any other information
                for your event."
            content={
              <TextEditor
                value={formik.values.body}
                onChange={(val) => formik.setFieldValue("body", val)}
              />
            }
          />
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
