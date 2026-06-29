import { useEffect, useState } from 'react';
import * as feedService from '../../../services/feedService';
import Spinner from '../../../shared/components/ui/Spinner';
import Avatar from '../../../shared/components/ui/Avatar';

import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const TYPE_ICONS = {
  review: 'movie',
  community: 'group',
  event: 'popcorn',
  user: 'user',
};

const ActivityFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await feedService.getSocialFeed();
        setFeed(res.data || []);
      } catch (err) {
        console.error('Failed to fetch activity feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
        <Spinner size="md" />
        <span className="mt-2 text-xs font-semibold">Syncing social feed...</span>
      </div>
    );
  }

  if (feed.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 text-sm">
        No recent activity. Connect with friends to see updates!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
      {feed.map((item) => (
        <div
          key={item.id}
          className="relative group flex items-start gap-4 p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 transform hover:-translate-y-0.5"
        >
          {/* Activity Type Indicator Icon */}
          <div className="absolute top-3 right-3 opacity-40 group-hover:opacity-80 transition-opacity">
            <PremiumIcon name={TYPE_ICONS[item.type]} size={16} color="#e8102a" />
          </div>

          {/* User Avatar */}
          <Avatar
            size="sm"
            src={item.user?.profilePicture}
            name={item.user?.name}
            className="ring-2 ring-white/[0.05]"
          />

          <div className="flex-1 min-w-0">
            {/* Title / Action Header */}
            <h4 className="text-sm font-semibold text-slate-200 leading-tight">
              {item.title}
            </h4>

            {/* Content Preview */}
            <p className="mt-1 text-xs text-slate-400 font-medium leading-relaxed truncate">
              {item.content}
            </p>

            {/* Timestamp */}
            <span className="mt-2 block text-[0.625rem] text-slate-500 font-bold tracking-wider uppercase">
              {new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
