"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";

type Member = {
  id: string;
  classification: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    occupation: string | null;
    company: string | null;
  } | null;
};

export function DirectoryList({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? members
    : members.filter((m) => {
        const p = m.profile;
        const haystack = [
          p?.first_name, p?.last_name, p?.occupation, p?.company, m.classification,
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      });

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pewter" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, occupation, or classification..."
          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rotary-blue/30 focus:border-rotary-blue"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-pewter mx-auto mb-4" />
            <h3 className="font-semibold text-charcoal mb-1">No members found</h3>
            <p className="text-sm text-pewter">
              {members.length === 0 ? "The member directory is currently empty." : "Try a different search."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profile?.avatar_url || ""} alt={member.profile ? `${member.profile.first_name} ${member.profile.last_name}` : ""} />
                    <AvatarFallback className="bg-rotary-blue text-white text-sm">
                      {member.profile ? `${member.profile.first_name?.[0] ?? ""}${member.profile.last_name?.[0] ?? ""}` : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-charcoal truncate">
                      {member.profile?.first_name} {member.profile?.last_name}
                    </h3>
                    {member.classification && (
                      <p className="text-sm text-pewter truncate">{member.classification}</p>
                    )}
                    {member.profile?.occupation && (
                      <p className="text-xs text-pewter truncate">{member.profile.occupation}</p>
                    )}
                    {member.profile?.company && (
                      <p className="text-xs text-pewter truncate">{member.profile.company}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
