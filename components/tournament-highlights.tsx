import Image from "next/image";

const tournamentPhotos = [
  { src: "/IMG_5143.JPG", alt: "Tournament action" },
  { src: "/IMG_5126.JPG", alt: "Tournament action" },
  { src: "/IMG_5137.JPG", alt: "Tournament action" },
  { src: "/IMG_7257.JPG", alt: "Game time" },
  { src: "/IMG_3713.JPG", alt: "On the court" },
  { src: "/IMG_7303.JPG", alt: "Tournament day" },
  { src: "/IMG_3770.JPG", alt: "Game day energy" },
  { src: "/IMG_7245.JPG", alt: "On the court" },
  { src: "/IMG_3778.JPG", alt: "Team spirit" },
  { src: "/IMG_7281.JPG", alt: "Competition" },
  { src: "/IMG_3808.JPG", alt: "Court action" },
  { src: "/IMG_3813.JPG", alt: "Celebrating together" },
  { src: "/IMG_7306.JPG", alt: "Community" },
  { src: "/IMG_3811.JPG", alt: "Tournament moments" },
  { src: "/IMG_5150.jpg", alt: "Tournament highlights" },
  { src: "/IMG_5151.jpg", alt: "Game day" },
  { src: "/IMG_5152.jpg", alt: "Court moments" },
  { src: "/IMG_5153.jpg", alt: "Players in action" },
];

export default function TournamentHighlights() {
  return (
    <section className="relative bg-slate-50 overflow-hidden border-t border-slate-100 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
            Past Tournaments
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4">
            Tournament Highlights
          </h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Scenes from the court — where community and competition come
            together.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-4 relative group rounded-2xl overflow-hidden border-2 border-amber-300 shadow-lg shadow-amber-500/10">
          <Image
            src="/team.jpg"
            alt="Tournament team photo"
            width={1200}
            height={400}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto columns-3 md:columns-3 gap-3 space-y-3">
          {tournamentPhotos.map((img, idx) => (
            <div
              key={idx}
              className="group relative break-inside-avoid rounded-xl overflow-hidden border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-500"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={500}
                className="w-full h-auto max-h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <p className="text-white font-medium text-sm tracking-wide">
                  {img.alt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
