import cx from "classnames";
import type { ReactNode } from "react";
import { useState, useEffect, forwardRef, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi";

import { useBalances } from "../hooks";
import { TOKENS, parseToFormattedNumber } from "../utils";

import { CoinsListDialog } from "./CoinsListDialog";
import { TokenIcon } from "./TokenIcon";

import { Button, Dialog, Tooltip, useDialog } from "~/systems/UI";
import type { Coin } from "~/types";

export type CoinSelectorProps = {
  coin?: Coin | null;
  isReadOnly?: boolean;
  showBalance?: boolean;
  showMaxButton?: boolean;
  onChange?: (coin: Coin) => void;
  onSetMaxBalance?: () => void;
  tooltip?: ReactNode;
};

export const CoinSelector = forwardRef<HTMLDivElement, CoinSelectorProps>(
  (
    {
      coin,
      isReadOnly,
      showBalance = true,
      showMaxButton = true,
      onChange,
      onSetMaxBalance,
      tooltip: tooltipContent,
    },
    ref
  ) => {
    const [selected, setSelected] = useState<Coin | null>(null);
    const dialog = useDialog();
    const { data: balances } = useBalances({ enabled: showBalance });
    const coinBalance = balances?.find(
      (item) => item.assetId === coin?.assetId
    );

    const balance = useMemo(
      () => parseToFormattedNumber(coinBalance?.amount || BigInt(0)),
      [coinBalance?.assetId, coinBalance?.amount]
    );

    function handleSelect(assetId: string) {
      const next = TOKENS.find((item) => item.assetId === assetId)!;
      dialog.close();
      setSelected(next);
      onChange?.(next);
    }

    const button = (
      <Button
        {...dialog.openButtonProps}
        size="md"
        isReadOnly={isReadOnly}
        className={cx("coinSelector", {
          "coinSelector--empty": !selected,
        })}
      >
        {selected &&
          (selected.img ||
            (coin?.pairOf && coin?.pairOf[0].img && coin?.pairOf[1].img)) && (
            <TokenIcon
              {...(coin?.pairOf
                ? { coinFrom: coin.pairOf[0], coinTo: coin.pairOf[1] }
                : { coinFrom: coin })}
            />
          )}
        {selected ? (
          <div className="ml-1">{selected?.name}</div>
        ) : (
          <div className="ml-2">Select token</div>
        )}
        {!isReadOnly && <FiChevronDown className="text-current" />}
      </Button>
    );

    useEffect(() => {
      if (!coin) return setSelected(null);
      setSelected(coin);
    }, [coin]);

    return (
      <div className="coinSelector--root" ref={ref}>
        {tooltipContent ? (
          <Tooltip content={tooltipContent}>{button}</Tooltip>
        ) : (
          button
        )}
        <Dialog {...dialog.dialogProps}>
          <Dialog.Content>
            <CoinsListDialog onSelect={handleSelect} />
          </Dialog.Content>
        </Dialog>
        {(showBalance || showMaxButton) && (
          <div className="flex items-center gap-2 mt-2 whitespace-nowrap">
            {showBalance && (
              <div
                className="text-xs text-gray-400"
                aria-label={`${coin?.name} balance`}
              >
                Balance: {balance}
              </div>
            )}
            {showMaxButton && (
              <Button
                size="sm"
                onPress={onSetMaxBalance}
                className="coinSelector--maxButton"
                variant="ghost"
              >
                Max
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);