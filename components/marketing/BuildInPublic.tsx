// "Built in public" section. Two paragraphs of original copy then the public
// profile explorer. Anchored at #bip for the nav "Resources" link.
import { Reveal } from "./Reveal";
import { ProfileExplorer } from "./ProfileExplorer";

export function BuildInPublic() {
  return (
    <section className="bip" id="bip">
      <div className="wrap">
        <div className="bip-grid">
          <Reveal>
            <h2>Built in public</h2>
          </Reveal>
          <Reveal delay="d1">
            <p>
              Open source powers the internet, but the builders behind it often
              stay <u>invisible</u>. Traditional metrics flatten engineers into
              numbers: commits, PRs, lines of code. That never paints the{" "}
              <u>whole picture</u>.
            </p>
          </Reveal>
          <Reveal delay="d2">
            <p>
              ShipScout surfaces what is <u>unique</u> about each creator: how
              they solve problems and where they apply real domain depth. No
              forms. No surveys. Just signal drawn from <u>real work</u>.
            </p>
          </Reveal>
        </div>
        <Reveal className="expl-lab" delay="d2">
          explore individual developer profiles
        </Reveal>
        <Reveal delay="d3">
          <ProfileExplorer />
        </Reveal>
      </div>
    </section>
  );
}
