"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { Search, Star, MapPin, DollarSign, Filter, X } from "lucide-react";

interface Specialist {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  service_areas: string[];
  rating_average: number;
  total_reviews: number;
  verification_status: string;
  user: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

function SpecialistsPageContent() {
  const supabase = createSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedServiceArea, setSelectedServiceArea] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);
  const [allServiceAreas, setAllServiceAreas] = useState<string[]>([]);

  useEffect(() => {
    fetchSpecialists();
  }, []);

  useEffect(() => {
    // Auto-focus search if coming from header
    if (searchParams.get("search") === "true" && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    filterSpecialists();
  }, [specialists, searchQuery, selectedSpecialty, selectedServiceArea, maxRate, minRating]);

  const fetchSpecialists = async () => {
    const { data, error } = await supabase
      .from("specialist_profiles")
      .select("*, user:user_id(full_name, avatar_url)")
      .eq("verification_status", "verified")
      .order("rating_average", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching specialists:", error);
      return;
    }

    if (data) {
      // Filter out specialists without user data
      const validSpecialists = data.filter((spec: any) => spec.user !== null) as Specialist[];
      setSpecialists(validSpecialists);
      setFilteredSpecialists(validSpecialists);

      // Extract unique specialties and service areas
      const specialties = new Set<string>();
      const serviceAreas = new Set<string>();
      validSpecialists.forEach((spec: any) => {
        spec.specialties?.forEach((s: string) => specialties.add(s));
        spec.service_areas?.forEach((a: string) => serviceAreas.add(a));
      });
      setAllSpecialties(Array.from(specialties).sort());
      setAllServiceAreas(Array.from(serviceAreas).sort());
    }

    setIsLoading(false);
  };

  const filterSpecialists = () => {
    let filtered = [...specialists];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (spec) =>
          spec.user?.full_name.toLowerCase().includes(query) ||
          spec.bio?.toLowerCase().includes(query) ||
          spec.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Specialty filter
    if (selectedSpecialty) {
      filtered = filtered.filter((spec) =>
        spec.specialties.includes(selectedSpecialty)
      );
    }

    // Service area filter
    if (selectedServiceArea) {
      filtered = filtered.filter((spec) =>
        spec.service_areas.includes(selectedServiceArea)
      );
    }

    // Max rate filter
    if (maxRate) {
      const max = parseFloat(maxRate);
      filtered = filtered.filter((spec) => spec.hourly_rate <= max);
    }

    // Min rating filter
    if (minRating) {
      const min = parseFloat(minRating);
      filtered = filtered.filter((spec) => spec.rating_average >= min);
    }

    setFilteredSpecialists(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSpecialty("");
    setSelectedServiceArea("");
    setMaxRate("");
    setMinRating("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <motion.div variants={slideUp} className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-primary-500 mb-4">
              Find Your IT Specialist
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Browse our verified specialists ready to help you with your technology needs
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={slideUp} className="card bg-white p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, specialty, or expertise..."
                  className="pl-12"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter size={20} className="mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-secondary-200"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Specialty
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="input"
                  >
                    <option value="">All Specialties</option>
                    {allSpecialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Service Area
                  </label>
                  <select
                    value={selectedServiceArea}
                    onChange={(e) => setSelectedServiceArea(e.target.value)}
                    className="input"
                  >
                    <option value="">All Areas</option>
                    {allServiceAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Max Hourly Rate ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    placeholder="No limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Min Rating
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    placeholder="Any rating"
                  />
                </div>
              </motion.div>
            )}

            {(selectedSpecialty || selectedServiceArea || maxRate || minRating) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-secondary-200">
                <span className="text-sm text-text-secondary">Active filters:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-primary-500"
                >
                  <X size={16} className="mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </motion.div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-text-secondary">
              Found {filteredSpecialists.length} specialist{filteredSpecialists.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filteredSpecialists.length === 0 ? (
            <motion.div
              variants={slideUp}
              className="card bg-white p-12 text-center"
            >
              <p className="text-xl text-text-secondary mb-4">
                No specialists found matching your criteria
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredSpecialists.map((specialist) => (
                <motion.div
                  key={specialist.id}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="card bg-white p-6 hover:shadow-large transition-shadow"
                >
                  <Link href={`/specialists/${specialist.id}`}>
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-text-primary mb-1">
                            {specialist.user?.full_name || "Unknown Specialist"}
                          </h3>
                          {specialist.verification_status === "verified" && (
                            <span className="inline-block px-2 py-1 text-xs bg-success-50 text-success-600 rounded">
                              Verified
                            </span>
                          )}
                        </div>
                        {specialist.rating_average > 0 && (
                          <div className="flex items-center gap-1 text-warning-500">
                            <Star size={20} fill="currentColor" />
                            <span className="font-semibold">
                              {specialist.rating_average.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {specialist.bio && (
                        <p className="text-text-secondary text-sm mb-4 line-clamp-3">
                          {specialist.bio}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        {specialist.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {specialist.specialties.slice(0, 3).map((specialty) => (
                              <span
                                key={specialty}
                                className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                            {specialist.specialties.length > 3 && (
                              <span className="px-2 py-1 text-xs text-text-tertiary">
                                +{specialist.specialties.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {specialist.service_areas.length > 0 && (
                          <div className="flex items-center gap-1 text-text-tertiary text-sm">
                            <MapPin size={16} />
                            <span>{specialist.service_areas[0]}</span>
                            {specialist.service_areas.length > 1 && (
                              <span>+{specialist.service_areas.length - 1} more</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-secondary-200">
                        <div className="flex items-center gap-1 text-text-primary font-semibold">
                          <DollarSign size={18} />
                          <span>$95/hr</span>
                        </div>
                        {specialist.total_reviews > 0 && (
                          <span className="text-sm text-text-tertiary">
                            {specialist.total_reviews} review{specialist.total_reviews !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function SpecialistsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SpecialistsPageContent />
    </Suspense>
  );
}

