"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const initialFormData = {
  apartmentId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  ssn: "",
  employer: "",
  jobTitle: "",
  monthlyIncome: "",
  employmentLength: "",
  currentAddress: "",
  rentAmount: "",
  landlordName: "",
  landlordPhone: "",
  consent: false,
};

export default function ApplyForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoadingApartments(true);

        const { data, error } = await supabase
          .from("Apartments")
          .select("apartment_id, address, pricing, bed, bath, is_occupied")
          .eq("is_occupied", 0)
          .order("apartment_id", { ascending: true });

        if (error) {
          throw error;
        }

        setApartments(data || []);
      } catch (error) {
        console.error("Error fetching apartments:", error);
        setApartments([]);
      } finally {
        setLoadingApartments(false);
      }
    };

    fetchApartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    if (!formData.consent) {
      setSubmitMessage({
        type: "error",
        text: "You must consent to a background and credit check before submitting.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in before submitting an application.");
      }

      const { error } = await supabase.from("RentalApplications").insert({
        user_id: user.id,
        apartment_id: formData.apartmentId
          ? Number(formData.apartmentId)
          : null,

        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),

        date_of_birth: formData.dob || null,
        ssn: formData.ssn.trim() || null,

        employer: formData.employer.trim() || null,
        job_title: formData.jobTitle.trim() || null,
        monthly_income: formData.monthlyIncome
          ? Number(formData.monthlyIncome)
          : null,
        employment_length: formData.employmentLength.trim() || null,

        current_address: formData.currentAddress.trim() || null,
        rent_amount: formData.rentAmount ? Number(formData.rentAmount) : null,
        landlord_name: formData.landlordName.trim() || null,
        landlord_phone: formData.landlordPhone.trim() || null,

        consent: formData.consent,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      setSubmitMessage({
        type: "success",
        text: "Application submitted successfully! We will review your application and get back to you soon.",
      });

      setFormData(initialFormData);
    } catch (error) {
      console.error("Error submitting application:", error);

      setSubmitMessage({
        type: "error",
        text:
          error.message ||
          "An error occurred while submitting your application. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Rental Application Form
          </h1>

          <h2 className="text-center text-xl font-extrabold text-gray-900">
            Be Sure To Be Logged In
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Please fill out the form below to apply for an apartment.
          </p>
        </div>

        {submitMessage.text && (
          <div
            className={`p-4 rounded-md ${
              submitMessage.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Apartment Selection Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Apartment Selection
            </h3>

            <div className="mt-4">
              <label
                htmlFor="apartment-id"
                className="block text-sm font-medium text-gray-700"
              >
                Select Apartment <span className="text-red-500">*</span>
              </label>

              {loadingApartments ? (
                <p className="mt-1 text-sm text-gray-500">
                  Loading apartments...
                </p>
              ) : (
                <select
                  name="apartmentId"
                  id="apartment-id"
                  value={formData.apartmentId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">-- Please select an apartment --</option>

                  {apartments.map((apartment) => (
                    <option
                      key={apartment.apartment_id}
                      value={apartment.apartment_id}
                    >
                      {apartment.address} - ${apartment.pricing}/month (
                      {apartment.bed} bed, {apartment.bath} bath)
                    </option>
                  ))}
                </select>
              )}

              {apartments.length === 0 && !loadingApartments && (
                <p className="mt-1 text-sm text-red-500">
                  No available apartments found.
                </p>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Personal Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  id="first-name"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  id="last-name"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="ssn"
                  className="block text-sm font-medium text-gray-700"
                >
                  Social Security Number (Optional)
                </label>

                <input
                  type="text"
                  name="ssn"
                  id="ssn"
                  value={formData.ssn}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Employment Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Employment Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="employer"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Employer
                </label>

                <input
                  type="text"
                  name="employer"
                  id="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="job-title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title
                </label>

                <input
                  type="text"
                  name="jobTitle"
                  id="job-title"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="monthly-income"
                  className="block text-sm font-medium text-gray-700"
                >
                  Monthly Income
                </label>

                <input
                  type="number"
                  name="monthlyIncome"
                  id="monthly-income"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="employment-length"
                  className="block text-sm font-medium text-gray-700"
                >
                  Length of Employment
                </label>

                <input
                  type="text"
                  name="employmentLength"
                  id="employment-length"
                  placeholder="e.g., 2 years"
                  value={formData.employmentLength}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rental History Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Rental History
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
              <div className="sm:col-span-2">
                <label
                  htmlFor="current-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Address
                </label>

                <input
                  type="text"
                  name="currentAddress"
                  id="current-address"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="rent-amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Rent Amount
                </label>

                <input
                  type="number"
                  name="rentAmount"
                  id="rent-amount"
                  value={formData.rentAmount}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="landlord-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Landlord's Name
                </label>

                <input
                  type="text"
                  name="landlordName"
                  id="landlord-name"
                  value={formData.landlordName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="landlord-phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Landlord's Phone
                </label>

                <input
                  type="tel"
                  name="landlordPhone"
                  id="landlord-phone"
                  value={formData.landlordPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Consent and Submit */}
          <div>
            <div className="flex items-center">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                checked={formData.consent}
                onChange={handleChange}
                required
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />

              <label
                htmlFor="consent"
                className="ml-2 block text-sm text-gray-900"
              >
                I consent to a background and credit check.
              </label>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}