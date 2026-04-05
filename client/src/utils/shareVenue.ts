export interface ShareVenueOptions {
  venueName: string;
  venueAddress: string;
  venueId: string;
  origin?: string;
}

export async function shareVenue(options: ShareVenueOptions): Promise<void> {
  const { venueName, venueAddress, venueId } = options;
  const origin = options.origin ?? window.location.origin;
  const shareData = {
    title: venueName,
    text: `${venueName} - ${venueAddress}`,
    url: `${origin}?venue=${venueId}`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      // User cancelled share - that's fine
    }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(
        `${venueName}\n${venueAddress}\n${shareData.url}`
      );
    } catch {
      // Clipboard not available
    }
  }
}
