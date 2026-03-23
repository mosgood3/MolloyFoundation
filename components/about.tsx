import Image from "next/image";

const memorialPhotos = [
  { src: "/molloy5.png", alt: "Matt's smile" },
  { src: "/molloy1.png", alt: "Matt with friends" },
  { src: "/molloy2.png", alt: "On the field" },
  { src: "/molloy3.png", alt: "Game day" },
  { src: "/molloy4.png", alt: "Celebrating together" },
  { src: "/molloy6.png", alt: "Family memories" },
  { src: "/IMG_1229.JPG", alt: "Remembering Matt" },
  { src: "/IMG_1512.JPG", alt: "Remembering Matt" },
];

function PhotoGrid({
  photos,
}: {
  photos: { src: string; alt: string }[];
}) {
  return (
    <div className="max-w-4xl mx-auto columns-3 md:columns-3 gap-3 space-y-3">
      {photos.map((img, idx) => (
        <div
          key={idx}
          className="group relative break-inside-avoid rounded-xl overflow-hidden border border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-500"
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={400}
            height={500}
            className="w-full h-auto max-h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
            <p className="text-white font-medium text-sm tracking-wide">
              {img.alt}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="relative bg-slate-50 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-60 -left-20 w-[400px] h-[400px] bg-amber-100/25 rounded-full blur-[100px]" />

      {/* ── In Memory Gallery ── */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              In Memory
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4">
              Remembering Matt
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              Celebrating the moments that defined Matt.
            </p>
          </div>

          <PhotoGrid photos={memorialPhotos} />
        </div>
      </div>

      {/* ── Tribute ── */}
      <div className="relative border-t border-slate-100 bg-slate-50">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              His Story
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-5">
              Honoring Matthew Molloy
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Celebrating a legacy of strength, joy, and community.
            </p>
          </div>

          <div className="space-y-10">
            {[
              {
                title: "Early Life & Athletics",
                content: [
                  `Matthew Molloy, affectionately known as "Matt" to his family and friends, was born on April 27, 1998 to parents Chris and Anne Molloy, and had two siblings: Emma and Jack. Growing up, Matt was a tremendous athlete who enjoyed competing and excelled in every sport he played, as well as in the classroom. He was named captain of the Football and Lacrosse teams at Rocky Hill High School, was a member of the National Honor Society, and received many awards and accolades from his teachers and coaches.`,
                ],
              },
              {
                title: "UConn & A Joy for Life",
                content: [
                  `Matt attended the University of Connecticut and graduated with an Economics degree. He was just 24 years old when he passed away from cancer in January of 2023. Matt lit up a room with a true zest for life and new experiences, always willing to engage in a conversation on a current event or discussion on the human condition.`,
                  `Even in the years following his athletic career, Matt was always moving. He loved to spend his free time skiing, juggling a soccer ball, skimboarding at the beach, playing ping-pong, watching or attending sporting events, and especially shooting hoops with friends. With all the treatments and hospital visits Matt went through, he never complained. He relished any chance to join his friends or family, even when he wasn't feeling well. Matt spent many of his most challenging days listening to music to help get him through.`,
                ],
              },
              {
                title: "The Foundation",
                content: [
                  `Although Matt left us way too early, and our hearts have been broken, we continue to keep his spirit alive through the Foundation and its fundraising events. It is our hope that this Foundation will make a small difference in the world by raising money to support children with cancer, those with special needs, and those battling life-threatening illnesses who believe in the healing power of music.`,
                ],
              },
              {
                title: "Molloy Madness 3v3",
                content: [
                  `In May of 2023, our first fundraising event, the Molloy Madness 3 v 3 Basketball Tournament was held at Elm Ridge Park in Rocky Hill, CT. We were very fortunate to have tremendous support from Matt's friends and their families, and it's grown to include teams from across Connecticut and beyond.`,
                  `Each year we carefully select charities that embody Matt's character — his passion for music and love for athletics — and all funds raised go directly to them.`,
                ],
              },
            ].map((section) => (
              <div key={section.title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-1 min-h-[40px] bg-gradient-to-b from-amber-500 to-amber-300 rounded-full self-stretch" />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {section.title}
                  </h3>
                  {section.content.map((p, i) => (
                    <p
                      key={i}
                      className="text-gray-600 leading-relaxed mb-3 last:mb-0"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
