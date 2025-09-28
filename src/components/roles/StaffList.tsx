
'use client';

import type { StaffMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StaffListProps {
  staff: StaffMember[];
}

const roleColors: Record<string, string> = {
  owner: 'bg-red-500/20 text-red-300',
  manager: 'bg-yellow-500/20 text-yellow-300',
  chef: 'bg-blue-500/20 text-blue-300',
  waiter: 'bg-green-500/20 text-green-300',
};

export function StaffList({ staff }: StaffListProps) {
  return (
    <Card className="bg-card/70 border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-cyan-400">Staff Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {staff.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${member.name}`} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <Badge className={cn("capitalize", roleColors[member.role] || 'bg-gray-500')}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
