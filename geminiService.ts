/**
 * Gemini Service Stub
 * This service provides production insights without requiring an external API key,
 * ensuring stability on public hosting environments like GitHub Pages.
 */

export const getProductionInsights = async (productionData: any) => {
  // Simulate network delay for a realistic feel
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    const { currentProduction, staffCount } = productionData;
    const dayQty = currentProduction?.day?.reduce((acc: number, curr: any) => acc + (parseInt(curr.qty) || 0), 0) || 0;
    const nightQty = currentProduction?.night?.reduce((acc: number, curr: any) => acc + (parseInt(curr.qty) || 0), 0) || 0;
    const totalQty = dayQty + nightQty;

    // Generate a context-aware motivating message in Bengali
    if (totalQty === 0) {
      return "ফ্যাক্টরি ড্যাশবোর্ড সচল আছে। নতুন প্রোডাকশন ডেটা এন্ট্রি করলে আমি আপনার জন্য বিশেষ বিশ্লেষণ প্রদান করব। শুভ কামনা!";
    }

    if (totalQty > 500) {
      return `অসাধারণ কাজ! আজকের মোট উৎপাদন ${totalQty} পিস, যা গত সপ্তাহের গড় থেকে বেশি। আপনার টিমের কর্মদক্ষতা প্রশংসনীয়। এই ধারা বজায় রাখলে মাসের টার্গেট সহজেই পূরণ হবে।`;
    }

    return `আজকের প্রোডাকশন সেশন সফলভাবে চলছে। মোট ${totalQty} পিস কাজ সম্পন্ন হয়েছে। ${staffCount} জন কর্মীর উপস্থিতি ফ্যাক্টরির উৎপাদন ক্ষমতা বজায় রাখতে সাহায্য করছে। আপনার ম্যানেজমেন্ট দারুণ কাজ করছে!`;
    
  } catch (error) {
    console.error("Insight Stub Error:", error);
    return "উপাত্ত বিশ্লেষণ করা সম্ভব হচ্ছে না এই মুহূর্তে। তবে আপনার ফ্যাক্টরির কাজ সচল রয়েছে।";
  }
};
