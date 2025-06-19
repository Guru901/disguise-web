import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PostItems = [
  {
    lable: "General",
    selectedOption: "general",
  },
  {
    lable: "Friends",
    selectedOption: "friends",
  },
  {
    lable: "All Posts",
    selectedOption: "all_posts",
  },
];

export function FetchOptions({
  selectedOption,
  setSelectedOption,
}: {
  selectedOption: string;
  setSelectedOption: (e: string) => void;
}) {
  return (
    <Tabs
      defaultValue="general"
      className="w-[400px]"
      value={selectedOption}
      onValueChange={(e) => setSelectedOption(e)}
    >
      <TabsList>
        {PostItems.map((postItem) => (
          <TabsTrigger
            value={postItem.selectedOption}
            key={postItem.selectedOption}
          >
            {postItem.lable}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
