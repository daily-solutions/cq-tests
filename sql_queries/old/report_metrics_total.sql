with calculated_columns as (
SELECT
"id" as id,
concat("testId",'-', "clientId",'-',"peerName",'-',"connectionId") as uniquename,
"testId" as testid,
"clientId" as clientid,
"reportNum" as reportnum,
"peerName" as peername,
"connectionId" as connectionid,
"type" as type,
"frameHeight" as frameheight,
"frameWidth" as framewidth,
"framesReceived" - lag("framesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framereceived_sec,
"bytesReceived" - lag("bytesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as bytesreceived_sec,
("bytesReceived" - lag("bytesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum"))*8 as bitsreceived_sec,
"bytesSent" - lag("bytesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as bytessent_sec,
"framesDecoded" - lag("framesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framedecoded_sec_old,
"totalDecodeTime" - lag("totalDecodeTime", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as decodetime_sec,
"framesSent" - lag("framesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framesent_sec,
"framesEncoded" - lag("framesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as frameencoded_sec,
"framesPerSecond" as framespersecond,
"keyframesDecoded" - lag("keyframesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesdecoded_sec,
"keyFramesEncoded" - lag("keyFramesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesencoded_sec,
"qpSum" - lag("qpSum", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as qpsum_sec,
"packetsReceived" as packetsreceived,
"packetsLost" - lag("packetsLost", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as packetslost_sec,
"packetsSent" as packetssent,
"pauseCount" - lag("pauseCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as pausecount_sec,
"pauseCount" as pausecount,
"freezeCount" - lag("freezeCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as freezecount_sec,
"freezeCount" as freezecount,
"totalPausesDuration" - lag("totalPausesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalpausesduration_sec,
"totalPausesDuration" as totalpausesduration,
"totalFreezesDuration" - lag("totalFreezesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalfreezesduration_sec,
"totalFreezesDuration" as totalfreezesduration,
"firCount" - lag("firCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as fircount_sec,
"firCount" as fircount,
"jitterBufferEmittedCount" - lag("jitterBufferEmittedCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as jitterbufferemittedcount_sec,
"jitterBufferEmittedCount" as jitterbufferemittedcount,
"jitter" as jitter,
"totalSamplesReceived" - lag("totalSamplesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesreceived_sec,
"totalSamplesReceived" as totalsamplesreceived,
"concealedSamples" - lag("concealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as concealedsamples_sec,
"concealedSamples" as concealedsamples,
"silentConcealedSamples" - lag("silentConcealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as silentconcealedsamples_sec,
"silentConcealedSamples" as silentconcealedsamples,
"insertedSamplesForDeceleration" - lag("insertedSamplesForDeceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as insertedsamplesfordeceleration_sec,
"insertedSamplesForDeceleration" as insertedsamplesfordeceleration,
"removedSamplesForAcceleration" - lag("removedSamplesForAcceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as removedsamplesforacceleration_sec,
"removedSamplesForAcceleration" as removedsamplesforacceleration,
"audioLevel" - lag("audioLevel", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as audiolevel_sec,
"audioLevel" as audiolevel,
"totalAudioEnergy" - lag("totalAudioEnergy", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalaudioenergy_sec,
"totalAudioEnergy" as totalaudioenergy,
"totalSamplesDuration" - lag("totalSamplesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesduration_sec,
"totalSamplesDuration" as totalsamplesduration,
case
  when "bytesReceived" = 0 then false
  when "bytesReceived" > 0 then true
  else false
end as werebytesreceived,
1/(("timestamp" - lag("timestamp", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum"))/1000) as percent_of_secs,
cast({{tResolutionHeight.value}} as numeric) as targetframeheight,
cast({{tResolutionWidth.value}} as numeric) as targetframewidth,
cast({{tBitrate.value}} as numeric) as targetbitrate,
cast({{tFramerate.value}} as numeric) as targetframerate,
cast({{callLength.value}} as numeric) as calllength

  
FROM public.processed

WHERE
("testId" = {{parseInt(testIdSelect.value)}} OR "testId" = ANY({{ table1.selectedRow.data.map(row => row.testid) }}))
AND "type" = 'inbound-rtp'
AND "kind" = 'video'
AND "peerName" != 'IT01V1234'
AND "peerName" != 'IT01V10'

),

calculate_real_frames as (
SELECT
*,
framedecoded_sec_old * percent_of_secs as adjusted_fps
  
FROM
calculated_columns as cc
),

calculate_lag_of_real_frame as (
SELECT
*,
lag(adjusted_fps, 1) over (partition by testid, clientid, peername, connectionid order by reportnum) as prev_adjusted_fps

FROM calculate_real_frames
),

average_of_real_frames as (
SELECT
*,
round(cast(adjusted_fps + prev_adjusted_fps as double precision)/2) as framedecoded_sec
  
FROM calculate_lag_of_real_frame as clorf

),


uniquefreezes as (
SELECT
distinct uniquename,
freezecount,
totalfreezesduration

FROM calculated_columns

),

rownumber_and_freezes as (
SELECT
cc.*,
cc.framedecoded_sec as now_framesdecoded_sec,
row_number() over (partition by cc.testid, cc.clientid, cc.peername, cc.werebytesreceived order by cc.reportnum) as testlength,
lag(cc.framedecoded_sec, 1) over (partition by cc.uniquename, cc.testid, cc.clientid, cc.peername, cc.connectionid, cc.type order by cc.reportnum) as prev_framedecoded_sec,
cc.framedecoded_sec - lag(cc.framedecoded_sec, 1) over (partition by cc.uniquename, cc.testid, cc.clientid, cc.peername, cc.connectionid, cc.type order by cc.reportnum) as framedecoded_sec_diff,
nullif(packetslost_sec, 0) / (packetssent + packetslost_sec) as packetssentlost_pct,
nullif(packetslost_sec, 0) / (packetsreceived + packetslost_sec) as packetsreceivedlost_pct,
uf.totalfreezesduration as previousfreezesduration,
cc.totalfreezesduration - uf.totalfreezesduration as freezedurationdelta,
row_number() over (partition by cc.uniquename, cc.freezecount order by cc.reportNum) as freezeseconds,
CASE
  WHEN abs(framedecoded_sec - lag(cc.framedecoded_sec, 1) over (partition by cc.testid, cc.clientid, cc.peername, cc.connectionid order by cc.reportnum)) >= {{ frchange.value }} THEN 1
  ELSE 0 END as did_framerate_change



FROM average_of_real_frames as cc left join uniquefreezes as uf
ON cc.uniquename = uf.uniquename
AND cc.freezecount = uf.freezecount+1),

more_than_freezedelta as (
SELECT
*,
CASE
  WHEN framedecoded_sec_diff < 0 THEN abs(framedecoded_sec_diff)
  WHEN framedecoded_sec_diff >= 0 THEN framedecoded_sec_diff
  ELSE 0 END as corrected_framesdecoded_sec_diff,
CASE
  WHEN freezedurationdelta is null THEN 0
  WHEN freezeseconds > freezedurationdelta THEN 1 
  ELSE 2 END as more_than_freezedelta
  
FROM
rownumber_and_freezes as rn
  
WHERE
werebytesreceived = true
AND
testlength <= {{callLength.value}}
),


freezes_per_second as (
SELECT
*,
CASE
  WHEN corrected_framesdecoded_sec_diff >= 2 THEN 1
  WHEN corrected_framesdecoded_sec_diff < 2 THEN 0
  ELSE 0 END as framesdecoded_diff_more_than,
CASE
  WHEN more_than_freezedelta = 2 then 1
  WHEN more_than_freezedelta = 1 then 1-(freezeseconds - freezedurationdelta)
  ELSE 0 end as freezes_per_second
  
  
FROM more_than_freezedelta as fd),

case_when_fps as(
SELECT
*,
CASE
  WHEN freezes_per_second >= 0 THEN freezes_per_second
  WHEN freezes_per_second < 0 THEN 0
  ELSE 0 end as fixed_freezes_per_second,
CASE
  WHEN freezes_per_second > 0 THEN 1
  WHEN freezes_per_second <= 0 THEN 0
  ELSE 0 END as did_freeze

FROM freezes_per_second as fps ),


somethinghere1 as (
SELECT
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type,
max(freezecount) as freezecount,
max(pausecount) as pausecount,
max(totalfreezesduration) as totalfreezesduration,
max(totalpausesduration) as totalpausesduration,
max(targetframerate) as targetframerate,
max(targetbitrate) as targetbitrate,
max(targetframeheight) as targetframeheight,
max(targetframewidth) as targetframewidth,
sum(targetframeheight - frameheight) as frameheightdelta,
sum(targetframewidth - framewidth) as framewidthdelta,
sum(targetbitrate - bitsreceived_sec) as bitratedelta,
sum(targetframerate - framedecoded_sec) as framesdecodeddelta,
max(framedecoded_sec) as framedecoded_sec,
max(bitsreceived_sec) as bitsreceived_sec,
max(prev_framedecoded_sec) as prev_framedecoded_sec,
max(fixed_freezes_per_second) as fixed_freezes_per_second,
max(frameheight) as frameheight,
max(framewidth) as framewidth,
max(did_framerate_change) as did_framerate_change


FROM case_when_fps as cwf 

GROUP BY
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type),

somethinghere2 as (
SELECT
id,
uniquename,
testid,
clientid,
reportnum,
peername,
connectionid,
type,
frameheight,
framewidth,
frameheightdelta,
framewidthdelta,
bitratedelta,
framesdecodeddelta,
framedecoded_sec,
prev_framedecoded_sec,
fixed_freezes_per_second,
did_framerate_change,
targetframeheight,
targetframewidth,
freezecount,
pausecount,
totalfreezesduration,
totalpausesduration,
(frameheightdelta / targetframeheight)*100 as frameHeightDeltaPct,
--max((cast(frameheightdelta as double precision) / (cast(targetframeheight as double precision)))*100) over (partition by uniquename, reportnum) as frameHeightDeltaPct,
--max((cast(framewidthdelta as double precision) / (cast(targetframewidth as double precision)))*100) over (partition by uniquename, reportnum) as frameWidthDeltaPct,
(framewidthdelta / targetframewidth)*100 as frameWidthDeltaPct,
--case when(max((cast(framesdecodeddelta as double precision) / (cast(targetframerate as double precision)))*100) over (partition by clientid,uniquename, reportnum)) < 0 then 0 else (max((cast(framesdecodeddelta as double precision) / (cast(targetframerate as double precision)))*100) over (partition by clientid, uniquename, reportnum)) end as framerateDeltaPct,
(framesdecodeddelta / targetframerate)*100 as framerateDeltaPct,
--case when(max((cast(bitratedelta as double precision) / (cast(targetbitrate as double precision)))*100) over (partition by uniquename, reportnum)) < 0 then 0 else (max((cast(bitratedelta as double precision) / (cast(targetbitrate as double precision)))*100) over (partition by uniquename, reportnum)) end as bitrateDeltaPct,
(bitratedelta / targetbitrate)*100 as bitrateDeltaPct,
targetbitrate,
bitsreceived_sec

FROM somethinghere1 as sh1 ),

somethinghere3 as (
SELECT
testid,
clientid,
uniquename,
reportnum,
max(freezecount) as freezecount,
max(pausecount) as pausecount,
max(totalfreezesduration) as totalfreezesduration,
max(totalpausesduration) as totalpausesduration,
(1 - max(fixed_freezes_per_second))*100 as freezes_per_second_delta_pctFixed,
(1 - max(did_framerate_change))*100 as smoothness_per_second_delta_pctFixed,
max(framesdecodeddelta) as framesdecodeddelta,
max(framedecoded_sec) as framedecoded_sec,
max(prev_framedecoded_sec) as prev_framedecoded_sec,
max(framerateDeltaPct) as framerateDeltaPct,
sum(100 - framerateDeltaPct) as framerateDeltaPctFixed,
max(bitratedelta) as bitratedelta,
max(bitsreceived_sec) as bitsreceived_sec,
max(bitrateDeltaPct) as bitrateDeltaPct,
sum(100 - bitrateDeltaPct) as bitrateDeltaPctFixed,
max(targetframeheight) as targetframeheight,
max(targetframewidth) as targetframewidth,
max(frameheight) as frameheight,
max(framewidth) as framewidth,
max(frameheightdelta) as frameheightdelta,
max(framewidthdelta) as framewidthdelta,
max(frameHeightDeltaPct) as frameheightdeltapct,
sum(100 - frameHeightDeltaPct) as frameHeightDeltaPctFixed,
max(frameWidthDeltaPct) as framewidthdeltapct,
sum(100 - frameWidthDeltaPct) as frameWidthDeltaPctFixed

FROM somethinghere2 as sh2

GROUP BY
testid,
clientid,
uniquename,
reportnum ),

freeze_cnt_query1 as (
SELECT
uniquename,
clientid,
testid,
max(freezecount) as freezecount_max,
max(pausecount) as pausecount_max,
max(totalfreezesduration) as totalfreezesduration_max,
max(totalpausesduration) as totalpausesduration_max


FROM more_than_freezedelta as fd2

GROUP BY
uniquename,
clientid,
testid),

freeze_cnt_query2 as (
SELECT
clientid,
testid,
avg(cast(freezecount_max as double precision)) as avg_freeze_count,
avg(cast(totalfreezesduration_max as double precision)) as avg_totalfreezesduration,
avg(cast(pausecount_max as double precision)) as avg_pause_count,
avg(cast(totalpausesduration_max as double precision)) as avg_totalpausesduration

FROM freeze_cnt_query1 as fcq1

GROUP BY
clientid,
testid
),

somethinghere4 as (
SELECT
sh3.testid,
sh3.clientid,
avg(sh3.freezes_per_second_delta_pctFixed) as freezes_per_second_delta_pctFixed,
avg(sh3.smoothness_per_second_delta_pctFixed) as smoothness_per_second_delta_pctFixed,
avg(sh3.framerateDeltaPctFixed) as framerateDeltaPctFixed,
avg(sh3.bitrateDeltaPctFixed) as bitrateDeltaPctFixed,
avg((sh3.frameHeightDeltaPctFixed + sh3.frameWidthDeltaPctFixed ) / 2) as frameSizeDeltaPctFixed,
sum (cast(max(fcq2.avg_totalfreezesduration) as double precision) / NULLIF(cast(avg(fcq2.avg_freeze_count) as double precision), 0)) over (partition by sh3.clientid, sh3.testid) as freezecount_sec_avg,
max(fcq2.avg_freeze_count) as avg_freeze_count


FROM somethinghere3 as sh3 left join freeze_cnt_query2 as fcq2
ON sh3.testid = fcq2.testid
AND sh3.clientid = fcq2.clientid

GROUP BY
sh3.testid,
sh3.clientid)


SELECT
testid,
avg(freezes_per_second_delta_pctFixed) as freezes_per_second_delta_pctFixed,
avg(smoothness_per_second_delta_pctFixed) as smoothness_per_second_delta_pctFixed,
avg(framerateDeltaPctFixed) as framerateDeltaPctFixed,
avg(bitrateDeltaPctFixed) as bitrateDeltaPctFixed,
avg(frameSizeDeltaPctFixed) as frameSizeDeltaPctFixed,
avg(avg_freeze_count) as avg_freeze_count,
avg(freezecount_sec_avg) as freezecount_sec_avg,
100 as target

FROM somethinghere4 as sh4

GROUP BY
testid