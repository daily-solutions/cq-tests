create view calculated_column_view as 

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
"framesPerSecond" as framespersecond,
"packetsReceived" as packetsreceived,
"packetsSent" as packetssent,
"pauseCount" as pausecount,
"freezeCount" as freezecount,
"firCount" as fircount,
"jitter" as jitter,
"totalPausesDuration" as totalpausesduration,
"totalFreezesDuration" as totalfreezesduration,
"jitterBufferEmittedCount" as jitterbufferemittedcount,
"totalSamplesReceived" as totalsamplesreceived,
"concealedSamples" as concealedsamples,
"silentConcealedSamples" as silentconcealedsamples,
"insertedSamplesForDeceleration" as insertedsamplesfordeceleration,
"removedSamplesForAcceleration" as removedsamplesforacceleration,
"audioLevel" as audiolevel,
"totalAudioEnergy" as totalaudioenergy,
"totalSamplesDuration" as totalsamplesduration,
"framesReceived" - lag("framesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framereceived_sec,
"bytesReceived" - lag("bytesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as bytesreceived_sec,
("bytesReceived" - lag("bytesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum"))*8 as bitsreceived_sec,
("bytesSent" - lag("bytesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum"))*8 as bitsssent_sec,
"bytesSent" - lag("bytesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as bytessent_sec,
"framesDecoded" - lag("framesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framedecoded_sec_old,
"totalDecodeTime" - lag("totalDecodeTime", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as decodetime_sec,
"framesSent" - lag("framesSent", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as framesent_sec,
"framesEncoded" - lag("framesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as frameencoded_sec_old,
"keyframesDecoded" - lag("keyframesDecoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesdecoded_sec,
"keyFramesEncoded" - lag("keyFramesEncoded", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as keyframesencoded_sec,
"qpSum" - lag("qpSum", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as qpsum_sec,
"packetsLost" - lag("packetsLost", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as packetslost_sec,
"pauseCount" - lag("pauseCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as pausecount_sec,
"freezeCount" - lag("freezeCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as freezecount_sec,
"totalPausesDuration" - lag("totalPausesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalpausesduration_sec,
"totalFreezesDuration" - lag("totalFreezesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalfreezesduration_sec,
"firCount" - lag("firCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as fircount_sec,
"jitterBufferEmittedCount" - lag("jitterBufferEmittedCount", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as jitterbufferemittedcount_sec,
"totalSamplesReceived" - lag("totalSamplesReceived", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesreceived_sec,
"concealedSamples" - lag("concealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as concealedsamples_sec,
"silentConcealedSamples" - lag("silentConcealedSamples", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as silentconcealedsamples_sec,
"insertedSamplesForDeceleration" - lag("insertedSamplesForDeceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as insertedsamplesfordeceleration_sec,
"removedSamplesForAcceleration" - lag("removedSamplesForAcceleration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as removedsamplesforacceleration_sec,
"audioLevel" - lag("audioLevel", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as audiolevel_sec,
"totalAudioEnergy" - lag("totalAudioEnergy", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as totalaudioenergy_sec,
"totalSamplesDuration" - lag("totalSamplesDuration", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum") as samplesduration_sec,
case
  when "bytesReceived" = 0 then false
  when "bytesReceived" > 0 then true
  else false
end as werebytesreceived,
case
  when "bytesSent" = 0 then false
  when "bytesSent" > 0 then true
  else false
end as werebytessent,
1 / NULLIF(("timestamp" - lag("timestamp", 1) over (partition by "testId", "clientId", "peerName", "connectionId" order by "reportNum")) / 1000, 0) as percent_of_secs

  
FROM public.processed

),

calculate_real_frames as (
SELECT
*,
framedecoded_sec_old * percent_of_secs as adjusted_decoded_fps,
frameencoded_sec_old * percent_of_secs as adjusted_encoded_fps
  
FROM
calculated_columns as cc
),

calculate_lag_of_real_frame as (
SELECT
*,
lag(adjusted_decoded_fps, 1) over (partition by testid, clientid, peername, connectionid order by reportnum) as prev_adjusted_decoded_fps,
lag(adjusted_encoded_fps, 1) over (partition by testid, clientid, peername, connectionid order by reportnum) as prev_adjusted_encoded_fps


FROM calculate_real_frames
),

average_of_real_frames as (
SELECT
*,
round(cast(adjusted_decoded_fps + prev_adjusted_decoded_fps as double precision)/2) as framedecoded_sec,
round(cast(adjusted_encoded_fps + prev_adjusted_encoded_fps as double precision)/2) as frameencoded_sec

  
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
row_number() over (partition by cc.testid, cc.clientid, cc.peername, cc.werebytesreceived order by cc.reportnum) as testlength_receive,
row_number() over (partition by cc.testid, cc.clientid, cc.peername, cc.werebytessent order by cc.reportnum) as testlength_send,
lag(cc.framedecoded_sec, 1) over (partition by cc.uniquename, cc.testid, cc.clientid, cc.peername, cc.connectionid, cc.type order by cc.reportnum) as prev_framedecoded_sec,
cc.framedecoded_sec - lag(cc.framedecoded_sec, 1) over (partition by cc.uniquename, cc.testid, cc.clientid, cc.peername, cc.connectionid, cc.type order by cc.reportnum) as framedecoded_sec_diff,
nullif(packetslost_sec, 0) / (packetssent + packetslost_sec) as packetssentlost_pct,
nullif(packetslost_sec, 0) / (packetsreceived + packetslost_sec) as packetsreceivedlost_pct,
uf.totalfreezesduration as previousfreezesduration,
cc.totalfreezesduration - uf.totalfreezesduration as freezedurationdelta,
row_number() over (partition by cc.uniquename, cc.freezecount order by cc.reportNum) as freezeseconds

FROM average_of_real_frames as cc left join uniquefreezes as uf
ON cc.uniquename = uf.uniquename
AND cc.freezecount = uf.freezecount+1),

more_than_freezedelta as (
SELECT
*,
abs(framedecoded_sec_diff) as corrected_framesdecoded_sec_diff,
CASE
  WHEN freezedurationdelta is null THEN 0
  WHEN freezeseconds > freezedurationdelta THEN 1 
  ELSE 2 END as more_than_freezedelta
  
FROM
rownumber_and_freezes as rn
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
  
  
FROM more_than_freezedelta as fd)


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

FROM freezes_per_second as fps

