"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Heart, Users, Globe, MapPin, Clock, FolderKanban } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { RotaryNewsItem } from "@/lib/utils/rss-parser";
import { formatRSSDate } from "@/lib/utils/rss-parser";

// ─── NEWS CARD COMPONENT ───
export default function NewsCard({ item }: { item: {
  title: string;
  link: string;
  description: string;
  date: string;
  imageUrl?: string;
  source: 'rotary-org' | 'club';
  isLocal: boolean;
}}) {
  const CardWrapper = item.isLocal ? Link : 'a';
  const href = item.isLocal ? item.link : item.link;

  return (
    <CardWrapper href={href} target={item.isLocal ? undefined : '_blank'} rel={item.isLocal ? undefined : 'noopener noreferrer'}>
      <Card className="hover:shadow-lg transition-shadow h-full group border-border">
        <div className="h-40 bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center relative overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            item.isLocal ? (
              <Heart className="h-10 w-10 text-rotary-blue/30" />
            ) : (
              <Globe className="h-10 w-10 text-rotary-blue/30" />
            )
          )}
          <Badge 
            className={`absolute top-2 right-2 text-xs ${
              item.isLocal 
                ? 'bg-rotary-gold text-black' 
                : 'bg-rotary-blue text-white'
            }`}
          >
            {item.isLocal ? 'Club News' : 'Rotary International'}
          </Badge>
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-charcoal mb-2 line-clamp-2 group-hover:text-rotary-blue transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-pewter mb-2 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-pewter">
              {item.isLocal ? formatDate(item.date) : formatRSSDate(item.date)}
            </span>
            {!item.isLocal && (
              <ArrowRight className="h-4 w-4 text-rotary-blue group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}

// ─── AVENUE CARD ───
export function AvenueCard({ avenue }: { avenue: any }) {
  return (
    <Link
      href={`/avenues-of-service/${avenue.slug}`}
      className="group p-6 rounded-xl border-2 border-border/50 hover:border-rotary-blue/40 hover:shadow-xl transition-all duration-200 bg-white"
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-rotary-blue/10 to-azure/10 flex items-center justify-center flex-shrink-0 group-hover:from-rotary-blue/20 group-hover:to-azure/20 transition-colors">
          <span className="text-2xl">{avenue.icon_key || '🎯'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-charcoal mb-1 group-hover:text-rotary-blue transition-colors truncate">
            {avenue.name}
          </h3>
          <p className="text-sm text-pewter line-clamp-2 leading-relaxed">{avenue.description}</p>
        </div>
      </div>
    </Link>
  );
}

// ─── EVENT CARD ───
export function EventCard({ event }: { event: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 border-border/50 group">
      <div className="h-44 bg-gradient-to-br from-rotary-blue/20 via-azure/15 to-rotary-blue/20 flex items-center justify-center relative">
        <Calendar className="h-14 w-14 text-rotary-blue/30" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
          <p className="text-xs font-bold text-rotary-blue">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
      <CardContent className="pt-4 pb-4">
        <h3 className="font-bold text-charcoal mb-1.5 line-clamp-1 group-hover:text-rotary-blue transition-colors">{event.title}</h3>
        <p className="text-sm text-pewter mb-3 line-clamp-2 leading-relaxed">{event.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-pewter flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(event.date)}
          </span>
          <Button asChild size="sm" variant="outline" className="border-rotary-blue/30 text-rotary-blue hover:bg-rotary-blue/5">
            <Link href={`/events/${event.slug}`}>Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── PROJECT CARD ───
export function ProjectCard({ project }: { project: any }) {
  return (
    <Link href={`/projects/${project.slug}`} className="block h-full">
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 border-border/50 h-full group">
        <div className="h-44 bg-gradient-to-br from-rotary-blue/15 via-azure/10 to-turquoise/15 flex items-center justify-center">
          <FolderKanban className="h-12 w-12 text-rotary-blue/25" />
        </div>
        <CardContent className="pt-4 pb-4">
          <h3 className="font-bold text-charcoal mb-1.5 line-clamp-1 group-hover:text-rotary-blue transition-colors">{project.title}</h3>
          <p className="text-sm text-pewter mb-3 line-clamp-2 leading-relaxed">{project.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs font-medium capitalize">{project.status}</Badge>
            {project.avenue && (
              <Badge variant="outline" className="text-xs">{project.avenue.name}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── BOARD MEMBER CARD ───
export function BoardMemberCard({ bm }: { bm: any }) {
  const profile = bm.member?.profile;
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Unknown";
  
  return (
    <div className="text-center group">
      <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-border group-hover:ring-rotary-blue/30 transition-colors">
        <AvatarImage src={bm.photo_url || profile?.avatar_url || ""} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-rotary-blue to-azure text-white font-bold text-lg">
          {profile ? getInitials(profile.first_name, profile.last_name) : "?"}
        </AvatarFallback>
      </Avatar>
      <h3 className="text-sm font-bold text-charcoal line-clamp-1 mb-0.5">{name}</h3>
      <p className="text-xs text-pewter font-medium">{bm.custom_title || bm.position?.title}</p>
    </div>
  );
}

// ─── MEETING INFO CARD ───
export function MeetingInfoCard({ meetingDay, meetingTime, meetingLocation }: {
  meetingDay: string;
  meetingTime: string;
  meetingLocation: string;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-border/50 p-6 shadow-sm">
      <div className="text-center mb-5">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rotary-blue to-azure text-white mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-charcoal">Next Meeting</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-lg bg-rotary-blue/10 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-rotary-blue" />
          </div>
          <div>
            <p className="text-xs text-pewter font-medium uppercase tracking-wide">Day</p>
            <p className="font-bold text-charcoal text-sm">{meetingDay}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-lg bg-rotary-gold/10 flex items-center justify-center flex-shrink-0">
            <Clock className="h-5 w-5 text-rotary-gold" />
          </div>
          <div>
            <p className="text-xs text-pewter font-medium uppercase tracking-wide">Time</p>
            <p className="font-bold text-charcoal text-sm">{meetingTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-lg bg-azure/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-azure" />
          </div>
          <div>
            <p className="text-xs text-pewter font-medium uppercase tracking-wide">Location</p>
            <p className="font-bold text-charcoal text-sm">{meetingLocation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
