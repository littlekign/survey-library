import { ResponsivityManager } from "../utils/responsivity-manager";
import { ListModel } from "../list";
import { Action, actionModeType, createDropdownActionModelAdvanced, IAction } from "./action";
import { ActionContainer, ContainerUpdateOptions } from "./container";
import { getLocaleString } from "../surveyStrings";
import { property } from "../jsonobject";

export enum UpdateResponsivenessMode {
  None = 0,
  Light = 1,
  Hard = 3
}

export type AdaptiveContainerUpdateOptions = { updateResponsivenessMode?: UpdateResponsivenessMode } & ContainerUpdateOptions;

export class AdaptiveActionContainer<T extends Action = Action> extends ActionContainer<T> {
  public dotsItem: Action;
  protected responsivityManager: ResponsivityManager;
  public minVisibleItemsCount: number = 0;
  public isResponsivenessDisabled = false;
  @property() private isInitialized: boolean = false;
  private hideItemsGreaterN(visibleItemsCount: number) {
    const actionsToHide = this.getActionsToHide();
    visibleItemsCount = Math.max(visibleItemsCount, this.minVisibleItemsCount - (this.visibleActions.length - actionsToHide.length));
    const hiddenItems: IAction[] = [];
    actionsToHide.forEach((item) => {
      if (visibleItemsCount <= 0) {
        item.mode = "popup";
        hiddenItems.push(item.innerItem);
      }
      visibleItemsCount--;
    });
    this.hiddenItemsListModel.setItems(hiddenItems);
  }

  private getActionsToHide() {
    return this.visibleActions.filter(action => !action.disableHide);
  }
  private updateItemMode(availableSpace: number, maxItemsSize: number) {
    const items = this.visibleActions;
    for (let index = items.length - 1; index >= 0; index--) {
      if (maxItemsSize > availableSpace && !items[index].disableShrink) {
        maxItemsSize -= items[index].maxDimension - items[index].minDimension;
        items[index].mode = "small";
      } else {
        items[index].mode = "large";
      }
    }
  }
  constructor() {
    super();

    this.dotsItem = createDropdownActionModelAdvanced({
      id: "dotsItem-id" + this.id++,
      css: "sv-dots",
      innerCss: "sv-dots__item",
      iconName: "icon-more",
      visible: false,
      tooltip: getLocaleString("more"),
    }, {
      items: [],
      allowSelection: false
    });
  }
  public get hiddenItemsListModel(): ListModel {
    return this.dotsItem.data as ListModel;
  }
  protected onSet(): void {
    super.onSet();
    this.raiseUpdate({ updateResponsivenessMode: UpdateResponsivenessMode.Hard });
  }

  protected onPush(action: T): void {
    super.onPush(action);
    this.raiseUpdate({ updateResponsivenessMode: UpdateResponsivenessMode.Hard });
  }
  protected onRemove(action: T): void {
    super.onRemove(action);
    this.raiseUpdate({ updateResponsivenessMode: UpdateResponsivenessMode.Hard });
  }

  protected onActionPropertyChanged(action: T, options: { name: string, newValue: any, oldValue: any }): void {
    super.onActionPropertyChanged(action, options);
    if (options.name == "_visible" || options.name == "_title") {
      action.needUpdateMaxDimension = action.visible;
      action.needUpdateMinDimension = action.visible;
      this.raiseUpdate({ updateResponsivenessMode: UpdateResponsivenessMode.Light });
    }
    if (options.name == "disableHide" && options.newValue && action.mode == "popup") {
      this.raiseUpdate({ updateResponsivenessMode: UpdateResponsivenessMode.Light });
    }
  }

  protected getRenderedActions(): Array<T> {
    const actions = super.getRenderedActions();
    if (actions.length == 0 || (actions.length === 1 && !!actions[0].iconName))
      return actions;
    return actions.concat([<T>this.dotsItem]);
  }

  protected getAllActions(): T[] {
    return this.actions.concat(<T>this.dotsItem);
  }

  protected getActionMinDimension(action: Action): number {
    return action.disableShrink ? action.maxDimension : action.minDimension;
  }

  private getVisibleItemsCount(options: { availableSpace: number, gap?: number }): number {
    let { availableSpace, gap } = options;
    availableSpace -= this.dotsItem.minDimension + gap;
    let currentItemsSize = 0;
    if (this.visibleActions[0].disableHide) {
      availableSpace += gap;
    } else {
      currentItemsSize -= gap;
    }
    this.visibleActions
      .filter((action) => action.disableHide)
      .forEach(action => {
        return availableSpace -= (this.getActionMinDimension(action) + gap);
      });
    const actionsToHide = this.getActionsToHide();
    if (actionsToHide.length === 1 && !!actionsToHide[0].iconName) {
      return 1;
    }
    for (let i = 0; i < actionsToHide.length; i++) {
      currentItemsSize += this.getActionMinDimension(actionsToHide[i]) + gap;
      if (currentItemsSize > availableSpace) {
        return i;
      }
    }
  }

  public fit(options: { availableSpace: number, gap?: number }): void {
    if (options.availableSpace <= 0) return;
    options.gap = options.gap ?? 0;
    const { availableSpace, gap } = options;

    this.dotsItem.visible = false;
    const actions = this.visibleActions;
    let minSize = - 1 * options.gap;
    let maxSize = - 1 * options.gap;
    actions.forEach((action) => {
      minSize += this.getActionMinDimension(action) + gap;
      maxSize += action.maxDimension + gap;
    });
    if (availableSpace >= maxSize) {
      this.setActionsMode("large");
    } else if (availableSpace < minSize) {
      this.setActionsMode("small");
      this.hideItemsGreaterN(this.getVisibleItemsCount(options));
      this.dotsItem.visible = !!this.hiddenItemsListModel.actions.length;
    } else {
      this.updateItemMode(options.availableSpace, maxSize);
    }
  }
  protected createResponsivityManager(container: HTMLDivElement): ResponsivityManager {
    return new ResponsivityManager(
      container, this
    );
  }
  protected mergeUpdateOptions(nextOptions: AdaptiveContainerUpdateOptions, prevOptions: AdaptiveContainerUpdateOptions): AdaptiveContainerUpdateOptions {
    const options = super.mergeUpdateOptions(nextOptions, prevOptions) as AdaptiveContainerUpdateOptions;
    options.updateResponsivenessMode = options.updateResponsivenessMode | prevOptions.updateResponsivenessMode;
    return options;
  }
  protected raiseUpdate(options?: AdaptiveContainerUpdateOptions): void {
    super.raiseUpdate(options);
  }
  protected update(options: AdaptiveContainerUpdateOptions): void {
    super.update(options);
    if (options.updateResponsivenessMode) {
      this.responsivityManager?.update(options.updateResponsivenessMode == UpdateResponsivenessMode.Hard);
    }
  }
  public initResponsivityManager(container: HTMLDivElement): void {
    if (!!this.responsivityManager) {
      if (this.responsivityManager.container == container) {
        return;
      }
      this.responsivityManager.dispose();
    }
    this.isInitialized = false;
    this.responsivityManager = this.createResponsivityManager(container);
    this.responsivityManager.afterInitializeCallback = () => {
      this.isInitialized = true;
    };
  }
  public resetResponsivityManager(): void {
    if (!!this.responsivityManager) {
      this.responsivityManager.dispose();
      this.responsivityManager = undefined;
    }
  }
  public getRootStyle() {
    if (!this.isInitialized && !this.isResponsivenessDisabled) {
      return { opacity: 0 };
    } else {
      return undefined;
    }
  }
  public setActionsMode(mode: actionModeType): void {
    this.actions.forEach((action) => {
      if (mode == "small" && action.disableShrink) {
        action.mode = "large";
      } else {
        action.mode = mode;
      }
    });
  }
  public dispose(): void {
    super.dispose();
    this.dotsItem.data.dispose();
    this.dotsItem.dispose();
    this.resetResponsivityManager();
  }
}