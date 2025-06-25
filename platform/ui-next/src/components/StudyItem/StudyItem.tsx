import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { ThumbnailList } from '../ThumbnailList';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../Accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';

function convertTo12Hour(timeStr) {
  const hours = parseInt(timeStr.slice(0, 2), 10);
  const minutes = timeStr.slice(2, 4);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes} ${period}`;
}

const StudyItem = ({
  date,
  description,
  numInstances,
  modalities,
  isActive,
  onClick,
  isExpanded,
  displaySets,
  activeDisplaySetInstanceUIDs,
  onClickThumbnail,
  onDoubleClickThumbnail,
  onClickUntrack,
  viewPreset = 'thumbnails',
  ThumbnailMenuItems,
  StudyMenuItems,
  StudyInstanceUID,
  studyTime,
}: withAppTypes) => {
  return (
    <Accordion
      type="single"
      collapsible
      onClick={onClick}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
      defaultValue={isActive ? 'study-item' : undefined}
    >
      <AccordionItem value="study-item">
        <AccordionTrigger className={classnames('hover:bg-accent bg-popover group w-full rounded')}>
          <div className="flex h-[40px] w-full flex-row overflow-hidden">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="flex min-w-0 flex-col items-start text-[13px]">
                <Tooltip>
                  <TooltipContent>{date}</TooltipContent>
                  <TooltipTrigger
                    className="w-full"
                    asChild
                  >
                    <div className="h-[18px] w-full max-w-[160px] overflow-hidden truncate whitespace-nowrap text-left text-white">
                      {date}
                      <span className='pl-4'>
                        {convertTo12Hour(studyTime)}
                      </span>
                    </div>
                  </TooltipTrigger>
                </Tooltip>
                <Tooltip>
                  <TooltipContent>{description}</TooltipContent>
                  <TooltipTrigger
                    className="w-full"
                    asChild
                  >
                    <div className="text-muted-foreground h-[18px] w-full overflow-hidden truncate whitespace-nowrap text-left">
                      {description}
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </div>
              <div className="text-muted-foreground flex flex-col items-end pl-[10px] text-[12px]">
                <div className="max-w-[150px] overflow-hidden text-ellipsis">{modalities}</div>
                <div>{numInstances}</div>
              </div>
              {StudyMenuItems && (
                <div className="ml-2 flex items-center">
                  <StudyMenuItems StudyInstanceUID={StudyInstanceUID} />
                </div>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent
          onClick={event => {
            event.stopPropagation();
          }}
        >
          {isExpanded && displaySets && (
            <ThumbnailList
              thumbnails={displaySets}
              activeDisplaySetInstanceUIDs={activeDisplaySetInstanceUIDs}
              onThumbnailClick={onClickThumbnail}
              onThumbnailDoubleClick={onDoubleClickThumbnail}
              onClickUntrack={onClickUntrack}
              viewPreset={viewPreset}
              ThumbnailMenuItems={ThumbnailMenuItems}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

StudyItem.propTypes = {
  date: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalities: PropTypes.string.isRequired,
  numInstances: PropTypes.number.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  isExpanded: PropTypes.bool,
  displaySets: PropTypes.array,
  activeDisplaySetInstanceUIDs: PropTypes.array,
  onClickThumbnail: PropTypes.func,
  onDoubleClickThumbnail: PropTypes.func,
  onClickUntrack: PropTypes.func,
  viewPreset: PropTypes.string,
  StudyMenuItems: PropTypes.func,
  StudyInstanceUID: PropTypes.string,
};

export { StudyItem };
