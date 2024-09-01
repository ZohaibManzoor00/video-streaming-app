export default function DailyMessage() {
  const dailyMessageExample = {
    intro: "Join us Live!",
    title: "Spotify Info Session",
    date: "on Sept 19, 2023",
  };

  return (
    <div className="flex flex-wrap text-lg gap-x-1 justify-center text-center">
      <p className="font-bold text-white">{dailyMessageExample.intro}</p>
      <p className={`text-rose-500 font-medium`}>{dailyMessageExample.title}</p>
      <p className="text-white">{dailyMessageExample.date}</p>
    </div>
  );
}
