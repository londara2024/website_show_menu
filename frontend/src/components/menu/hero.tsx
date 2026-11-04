// Hidden for now — uncomment this, the import, and the grid below to bring the spec tiles back.
// import { Award, Coffee, Droplet, Leaf, type LucideIcon } from "lucide-react";
//
// const SPECS: { icon: LucideIcon; label: string; value: string }[] = [
//   { icon: Coffee, label: "វដ្តលីង", value: "បាច់តូច (48 ម៉ោង)" },
//   { icon: Leaf, label: "ប្រភព", value: "ទិញផ្ទាល់ពីកសិករ 100%" },
//   { icon: Droplet, label: "ការចម្រោះទឹក", value: "ចម្រោះ RO 130ppm" },
//   { icon: Award, label: "អេសប្រេសូ", value: "មូលដ្ឋាន Ristretto ទ្វេ" },
// ];

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-high/40 via-surface/60 to-background pt-10 pb-12">
      <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-cocoa-container/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-20 size-80 rounded-full bg-honey-fixed/30 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-3 text-center">
          <h1 className="font-heading text-[28px] leading-normal font-medium text-on-surface md:text-[40px] md:leading-normal">
            កាហ្វេលំដាប់ខ្ពស់ និងភេសជ្ជៈផ្សេងៗ
          </h1>
          <p className="font-heading text-[19px] leading-normal font-semibold text-cocoa">
            ឆុងស្រស់ៗ រៀបចំយ៉ាងល្អឥតខ្ចោះ។ ស្វែងរកកែវដែលអ្នកពេញចិត្ត។
          </p>
          <p className="max-w-2xl pt-1 text-[15px] leading-relaxed text-on-surface-variant">
            គ្រាប់កាហ្វេប្រភពតែមួយ ទិញដោយយុត្តិធម៌ លីងក្នុងស្រុកជាបាច់តូចៗ និងចម្រាញ់យ៉ាងល្អឥតខ្ចោះ។
            រៀបចំតាមការកុម្ម៉ង់ ជាមួយទឹកដោះគោស្រស់ ទឹកដោះ oat សរីរាង្គ ឬទឹកដោះអាល់ម៉ុនរបស់ហាង តាមចំណូលចិត្តរបស់អ្នក។
          </p>
        </div>

        {/* Spec tiles (hidden)
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-4 pt-6 md:grid-cols-4">
          {SPECS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-surface-container-lowest/80 p-3 shadow-card backdrop-blur-sm"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-roast">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="label-caps text-cocoa">{label}</div>
                <div className="truncate text-[13px] leading-relaxed font-semibold text-on-surface">{value}</div>
              </div>
            </div>
          ))}
        </div>
        */}
      </div>
    </div>
  );
}
