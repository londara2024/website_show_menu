import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";

const heading = "label-caps text-inverse-roast";

export function SiteFooter() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-[1200px] px-5 pt-14 pb-8 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo inverted />
            <p className="font-heading text-xl text-inverse-roast">“កាហ្វេឆ្ងាញ់ ពេលវេលាល្អ។”</p>
            <p className="text-[13px] leading-relaxed text-inverse-on-surface/80">
              កាហ្វេលីងបាច់តូច កាហ្វេចាក់ដៃតាមរដូវ និងនំដុតស្រស់ៗរៀងរាល់ថ្ងៃ
              ក្នុងបន្ទប់ទទួលទានដ៏ស្ងប់ស្ងាត់។
            </p>
          </div>

          <div className="space-y-3">
            <span className={heading}>ម៉ោងបើក</span>
            <div className="space-y-2 text-[13px] leading-relaxed">
              <div>
                <span className="block font-semibold">ច័ន្ទ – សុក្រ</span>6:30 ព្រឹក – 8:00 យប់
              </div>
              <div>
                <span className="block font-semibold">សៅរ៍ – អាទិត្យ</span>7:00 ព្រឹក – 9:00 យប់
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className={heading}>ទីតាំងហាង</span>
            <address className="space-y-1.5 text-[13px] leading-relaxed not-italic">
              <div>ផ្ទះលេខ 742 ផ្លូវ Evergreen</div>
              <div>សង្កាត់ Craft Roast</div>
              <div>
                <a href="tel:+15550198421" className="hover:text-inverse-roast">
                  (555) 019-8421
                </a>
              </div>
              <div>
                <a href="mailto:atelier@coffeeshop.craft" className="hover:text-inverse-roast">
                  atelier@coffeeshop.craft
                </a>
              </div>
            </address>
          </div>

          <div className="space-y-3">
            <span className={heading}>ព្រឹត្តិប័ត្រព័ត៌មាន</span>
            <p className="text-[13px] leading-relaxed text-inverse-on-surface/80">
              ទទួលកំណត់ត្រាភ្លក់រសជាតិប្រចាំខែ និងព័ត៌មានគ្រាប់កាហ្វេតាមរដូវ។
            </p>
            <form className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 p-1">
              <Input
                type="email"
                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                aria-label="អាសយដ្ឋានអ៊ីមែល"
                className="h-9 border-0 bg-transparent text-inverse-on-surface placeholder:text-inverse-on-surface/60 focus-visible:ring-0 dark:bg-transparent"
              />
              <Button type="button" size="sm" className="label-caps h-8 bg-[#6f3e23] px-3 text-white hover:bg-[#54280f]">
                ចុះឈ្មោះ
              </Button>
            </form>
            <div className="flex items-center gap-2 text-[13px]">
              <a href="#" className="hover:text-inverse-roast">Instagram</a>
              <span className="text-inverse-on-surface/40">•</span>
              <a href="#" className="hover:text-inverse-roast">Pinterest</a>
              <span className="text-inverse-on-surface/40">•</span>
              <a href="#" className="hover:text-inverse-roast">Facebook</a>
            </div>
          </div>
        </div>

        <Separator className="mt-12 mb-6 bg-white/10" />

        <div className="flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 CoffeeShop Roastery &amp; Café។ រក្សាសិទ្ធិគ្រប់យ៉ាង។</div>
          <div className="text-inverse-on-surface/70">ម៉ឺនុយកាហ្វេសិប្បកម្ម សម្រាប់ទទួលទាននៅហាង</div>
        </div>
      </div>
    </footer>
  );
}
