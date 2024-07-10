with cc_and_targets as (
SELECT
*,
CASE
WHEN abs(framedecoded_sec - lag(framedecoded_sec, 1) over (partition by testid, clientid, peername, connectionid order by reportnum)) >= {{ frchange.value }} THEN 1
ELSE 0 END as did_framerate_change,
cast({{tResolutionHeight.value}} as numeric) as targetframeheight,
cast({{tResolutionWidth.value}} as numeric) as targetframewidth,
cast({{tBitrate.value}} as numeric) as targetbitrate,
cast({{tFramerate.value}} as numeric) as targetframerate,
cast({{callLength.value}} as numeric) as calllength 

FROM calculated_column_view
  
WHERE
(testid = {{parseInt(testIdSelect.value)}} OR testid = ANY({{ table1.selectedRow.data.map(row => row.testid) }}))
AND type = 'inbound-rtp'
AND kind = 'video'
AND peername != 'IT01V1234'
AND peername != 'IT01V10'
AND werebytesreceived = true
AND testlength_receive <= {{callLength.value}}

),


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
freezecount as freezecount,
pausecount as pausecount,
totalfreezesduration as totalfreezesduration,
totalpausesduration as totalpausesduration,
targetframerate as targetframerate,
targetbitrate as targetbitrate,
targetframeheight as targetframeheight,
targetframewidth as targetframewidth,
targetframeheight - frameheight as frameheightdelta,
targetframewidth - framewidth as framewidthdelta,
targetbitrate - bitsreceived_sec as bitratedelta,
targetframerate - framedecoded_sec as framesdecodeddelta,
prev_framedecoded_sec as prev_framedecoded_sec,
fixed_freezes_per_second as fixed_freezes_per_second,
did_framerate_change as did_framerate_change


FROM cc_and_targets as ccat
),

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
fixed_freezes_per_second,
did_framerate_change,
freezecount,
pausecount,
totalfreezesduration,
totalpausesduration,
(frameheightdelta / targetframeheight)*100 as frameHeightDeltaPct,
(framewidthdelta / targetframewidth)*100 as frameWidthDeltaPct,
(framesdecodeddelta / targetframerate)*100 as framerateDeltaPct,
(bitratedelta / targetbitrate)*100 as bitrateDeltaPct

FROM somethinghere1 as sh1 ),

somethinghere3 as (
SELECT
testid,
clientid,
uniquename,
reportnum,
totalfreezesduration as totalfreezesduration,
totalpausesduration as totalpausesduration,
(1 - fixed_freezes_per_second)*100 as freezes_per_second_delta_pctFixed,
(1 - did_framerate_change)*100 as smoothness_per_second_delta_pctFixed,
100 - framerateDeltaPct as framerateDeltaPctFixed,
100 - bitrateDeltaPct as bitrateDeltaPctFixed,
100 - frameHeightDeltaPct as frameHeightDeltaPctFixed,
100 - frameWidthDeltaPct as frameWidthDeltaPctFixed

FROM somethinghere2 as sh2 ),

freeze_cnt_query1 as (
SELECT
uniquename,
clientid,
testid,
max(freezecount) as freezecount_max,
max(pausecount) as pausecount_max,
max(totalfreezesduration) as totalfreezesduration_max,
max(totalpausesduration) as totalpausesduration_max


FROM calculated_column_view as fd2

GROUP BY
uniquename,
clientid,
testid
),

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
)


SELECT
sh3.testid,
sh3.clientid,
avg(sh3.freezes_per_second_delta_pctFixed) as freezes_per_second_delta_pctFixed,
avg(sh3.smoothness_per_second_delta_pctFixed) as smoothness_per_second_delta_pctFixed,
avg(sh3.framerateDeltaPctFixed) as framerateDeltaPctFixed,
avg(sh3.bitrateDeltaPctFixed) as bitrateDeltaPctFixed,
avg((sh3.frameHeightDeltaPctFixed + sh3.frameWidthDeltaPctFixed ) / 2) as frameSizeDeltaPctFixed,
--sum (cast(max(fcq2.avg_totalfreezesduration) as double precision) / NULLIF(cast(avg(fcq2.avg_freeze_count) as double precision), 0)) over (partition by sh3.clientid, sh3.testid) as freezecount_sec_avg,
--avg(sh3.freezecount) as avg_freeze_count,
100 as target


FROM somethinghere3 as sh3 left join freeze_cnt_query2 as fcq2
ON sh3.testid = fcq2.testid
AND sh3.clientid = fcq2.clientid

GROUP BY
sh3.testid,
sh3.clientid