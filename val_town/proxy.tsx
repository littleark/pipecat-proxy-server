import { Hono } from "npm:hono@3";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const app = new Hono();
app.get("/", (c) => c.text("Hello from miot!"));

app.post("/connect-pipecat", async (c) => {
  try {
    const { config } = await c.req.json();

    console.log(
      `Fetching https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}/start`,
    );
    const botData = {
      greeting: config.greeting,
      transportType: "daily",
      metadata: config.metadata,
    };
    console.log("botData", botData);
    const body = {
      student: botData.metadata.studentName,
      chapter: botData.metadata.chapter,
      book: botData.metadata.book.title,
      prompt: botData.metadata.character.prompt,
      section_type: botData.metadata.book.section_type,
      character_name: botData.metadata.character.name,
    };
    console.log("body", body);
    const response = await fetch(
      `https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PIPECAT_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Create Daily room
          createDailyRoom: true,
          privacy: "private",
          // Optionally set Daily room properties
          dailyRoomProperties: {
            start_video_off: true,
            geo: "ap-south-1",
            exp: +new Date() / 1000 + 610, // time in minutes now + 10 minutes + 10 seconds
            max_participants: 2,
            eject_at_room_exp: true,
          },
          // Optionally pass custom data to the bot
          body,
          // body: JSON.stringify(updatedBotConfig),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("DATA", data);
    // Transform to what your RTVI client expects
    return c.json({
      room_url: data.dailyRoom,
      token: data.dailyToken,
    });
  } catch (error) {
    console.error("API error:", error);
    return c.json({ error: "Failed to start agent" }, 500);
  }
});
app.post("/get-book", async (c) => {
  try {
    const { book_id } = await c.req.json();

    if (!book_id) {
      return c.json({ error: "book_id is required" }, 400);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
    );

    // Fetch book data from the books table
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", book_id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return c.json({ error: "Failed to fetch book data" }, 500);
    }

    if (!data) {
      return c.json({ error: "Book not found" }, 404);
    }

    return c.json(data);
  } catch (error) {
    console.error("API error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/update-words", async (c) => {
  try {
    const { words, book_id, chapter } = await c.req.json();

    // Validate required fields
    if (!book_id) {
      return c.json({ error: "book_id is required" }, 400);
    }
    if (chapter === undefined || chapter === null) {
      return c.json({ error: "chapter is required" }, 400);
    }
    if (!Array.isArray(words)) {
      return c.json({ error: "words must be an array" }, 400);
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
    );

    // Update the words field for the specific book and chapter
    const { data, error } = await supabase
      .from("books_spelling")
      .upsert(
        {
          book_id,
          chapter,
          words,
        },
        {
          onConflict: "book_id,chapter", // You'll need a unique constraint on these columns
        },
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return c.json({ error: "Failed to update words" }, 500);
    }

    if (!data) {
      return c.json({ error: "Book or chapter not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Words updated successfully",
      data,
    });
  } catch (error) {
    console.error("API error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app.fetch;
