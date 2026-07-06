import { RouteLog } from "@/src/types";
import FeatureTypes from "./FeatureTypes";
import CollapsibleBlock from "../CollapsibleBlock";

export default function FeatureTypesSection({
  holdTypes,
  routeTypes,
  footPlacements,
  handPlacements,
  route,
  handleUpdateRouteField,
}: {
  holdTypes: string[];
  routeTypes: string[];
  footPlacements: string[];
  handPlacements: string[];
  route: RouteLog;
  handleUpdateRouteField;
}) {

  const handleFeatureTypesToggle = (routeId: string, currentFeatures: string[], newAddition: string, fieldToUpdate: keyof RouteLog) => {
    const _currentFeatures = currentFeatures ?? [];

    const updatedList = _currentFeatures.includes(newAddition)
      ? _currentFeatures.filter(f => f !== newAddition)
      : [..._currentFeatures, newAddition];

    handleUpdateRouteField(routeId, fieldToUpdate, updatedList);
  };

  return (
    < div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
      <CollapsibleBlock title={"Holds & Climbing Styles"}>
        <div className="bg-cream-card p-3 rounded-2xl border border-rose-border shadow-3xs flex flex-col justify-between">
          <FeatureTypes
            title="Holds Features (multi-select)"
            allOptions={holdTypes}
            selectedOptions={route.holdsType}
            onSelect={(option) => { handleFeatureTypesToggle(route.id, route.holdsType, option, 'holdsType') }}
          />
        </div>
        <div className="bg-cream-card p-3 rounded-2xl border border-rose-border shadow-3xs flex flex-col justify-between">
          <FeatureTypes
            title="Styles / features (multi-select)"
            allOptions={routeTypes}
            selectedOptions={route.routeType}
            cssClassnamesForSelected={'bg-sky-accent border-sky-accent/[0.45] text-choco-dark shadow-3xs'}
            onSelect={(option) => { handleFeatureTypesToggle(route.id, route.routeType, option, 'routeType') }}
          />
        </div>
      </CollapsibleBlock>

      {/* Hand & Foot Techniques */}
      <CollapsibleBlock
        title="Climbing Techniques"
      >
        <div className="bg-cream-card p-3 rounded-2xl border border-rose-border shadow-3xs flex flex-col justify-between">
          <FeatureTypes
            title="Foot Placements"
            allOptions={footPlacements}
            selectedOptions={route.footPlacements}
            cssClassnamesForSelected={'bg-sky-accent border-sky-accent/[0.45] text-choco-dark shadow-3xs'}
            onSelect={(option) => { handleFeatureTypesToggle(route.id, route.footPlacements, option, 'footPlacements') }}
          />
        </div>

        <div className="bg-cream-card p-3 rounded-2xl border border-rose-border shadow-3xs flex flex-col justify-between">
          <FeatureTypes
            title="Hand Placements"
            allOptions={handPlacements}
            selectedOptions={route.handPlacements}
            cssClassnamesForSelected={'bg-sky-accent border-sky-accent/[0.45] text-choco-dark shadow-3xs'}
            onSelect={(option) => { handleFeatureTypesToggle(route.id, route.handPlacements, option, 'handPlacements') }}
          />
        </div>
      </CollapsibleBlock>

    </div >
  );
}
